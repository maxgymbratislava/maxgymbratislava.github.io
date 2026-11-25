const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const privacy = fs.readFileSync('assets/js/privacy.js','utf8');
const relay = fs.readFileSync(process.env.MAXGYM_TEST_RELAY || 'scripts/simplybook-paid-gtm.html','utf8').replace(/^<script[^>]*>\s*|\s*<\/script>\s*$/g,'');
const sourceKey='maxgym-source-v1';
class Store extends Map {getItem(k){return this.get(k)||null}setItem(k,v){this.set(k,String(v))}removeItem(k){this.delete(k)}key(i){return [...this.keys()][i]}get length(){return this.size}}
class El {constructor(tag){this.tagName=tag;this.children=[];this.events={}}append(...c){this.children.push(...c)}appendChild(c){this.append(c)}setAttribute(k,v){this[k]=v}addEventListener(k,v){this.events[k]=v}focus(){}click(){this.events.click()}}
const consent=(a,m)=>({version:1,analytics:a,marketing:m,time:Date.now()});
function host({a=false,m=false,saved=true,url='https://maxgym.sk/rezervacia/?utm_source=instagram&utm_medium=paid_social&utm_campaign=maxgym_pro_sparing_03&utm_content=posli_to_sparingovi',store=new Store()}={}){
  if(saved)store.setItem('maxgym-consent-v1',JSON.stringify(consent(a,m)));
  const nodes=[],listeners={},sent=[],frame={contentWindow:{postMessage:(d,o)=>sent.push({d,o})}},head=new El('head');
  const links=[{href:'https://maxgymbratislava.simplybook.it/v2/book/'},{href:'https://example.com'}];
  const document={documentElement:{lang:'sk'},head,body:new El('body'),referrer:'https://instagram.com/',cookie:'',
    createElement:t=>{const e=new El(t);nodes.push(e);return e},createTextNode:t=>({textContent:t}),
    getElementById:id=>head.children.find(x=>x.id===id),querySelector:()=>frame,querySelectorAll:()=>links};
  const window={addEventListener:(k,v)=>listeners[k]=v};
  vm.runInNewContext(privacy,{window,document,location:{href:url,hostname:'maxgym.sk',reload(){}},URL,Date,localStorage:store});
  const send=(d,origin='https://maxgymbratislava.simplybook.it',source=frame.contentWindow)=>listeners.message({data:d,origin,source});
  const ga=()=>window.dataLayer?window.dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='event'):[];
  const meta=()=>window.fbq?window.fbq.queue:[];
  return{window,document,nodes,store,links,sent,send,ga,meta,click:t=>nodes.find(n=>n.textContent===t).click()};
}
const paid={event:'maxgymPaymentAccepted',reference:'42',processor:'stripe',invoiceNumber:'SI-2026000042',amount:10,currency:'EUR',email:'secret@example.com'};
let h=host({a:true,m:true}); h.send(paid);
assert.equal(JSON.stringify(h.ga().map(x=>x[1])),JSON.stringify(['booking_paid','purchase']));
let p=h.ga().find(x=>x[1]==='purchase')[2];
assert.equal(p.transaction_id,'SI-2026000042');assert.equal(p.invoice_id,'42');assert.equal(p.value,10);assert.equal(p.currency,'EUR');assert.equal(p.mg_campaign,'maxgym_pro_sparing_03');assert.equal(p.mg_content,'posli_to_sparingovi');assert(!JSON.stringify(h.ga()).includes('secret@'));
h.send(paid);h.send({event:'bookingDone',id:42,payment_processor:'stripe'});assert.equal(h.ga().length,2);
assert.equal(h.meta().filter(x=>x[1]==='Purchase').length,1);
h=host({a:true,m:true,store:h.store});h.send(paid);assert.equal(h.ga().length,0,'Replay after reload is not counted');
h=host({a:true,m:false});h.send({event:'bookingDone',id:42,payment_processor:'stripe'});h.send(paid);assert.equal(h.ga().length,2,'Enrichment after a legacy message still records one purchase');assert.equal(h.meta().length,0);
h=host({a:false,m:true});h.send(paid);assert.equal(h.ga().length,0);assert.equal(h.store.has(sourceKey),false);assert.equal(h.meta().filter(x=>x[1]==='Purchase').length,1);
h=host({a:false,m:false});h.send(paid);assert.equal(h.ga().length,0);assert.equal(h.meta().length,0);assert.equal(h.store.has(sourceKey),false);
h=host({saved:false});h.send(paid);assert.equal(h.ga().length,0);h.click('Prijať všetko');h.send(paid);assert.equal(h.ga().length,2,'Refusal did not write a measurement dedupe marker');
h=host({a:true});h.send(paid,'https://evil.example');h.send(paid,'https://maxgymbratislava.simplybook.it',{});h.send({...paid,processor:'delay'});h.send({event:'bookingDone'});assert.equal(h.ga().length,0,'Foreign messages and Pay Later rejected');
h.send({...paid,amount:NaN});assert.equal(h.ga().filter(x=>x[1]==='purchase').length,0);h.send(paid);assert.equal(h.ga().filter(x=>x[1]==='purchase').length,1,'Invalid value did not poison purchase dedupe');
let first=host({a:true});let returning=host({a:true,store:first.store,url:'https://maxgym.sk/rezervacia/'});returning.send(paid);assert.equal(returning.ga()[1][2].mg_campaign,'maxgym_pro_sparing_03','Tagged source retained across site navigation');
h=host({a:true,url:'https://maxgym.sk/rezervacia/'});h.send(paid);assert.equal(h.ga()[1][2].mg_attribution,'unknown','Unknown is not fabricated as an ad conversion');
let expired=new Store([[sourceKey,JSON.stringify({campaign:'old',time:Date.now()-31*86400000,basis:'tagged_click'})]]);h=host({a:true,store:expired,url:'https://maxgym.sk/rezervacia/'});h.send(paid);assert.equal(h.ga()[1][2].mg_campaign,'unknown');
h=host({a:true});h.send({event:'maxgymMeasurementReady'});assert(h.sent.some(x=>x.d.event==='maxgymMeasurementContext'));assert(h.links[0].href.includes('utm_campaign=maxgym_pro_sparing_03'));assert.equal(h.links[1].href,'https://example.com');
function child({standalone=false,cookie=true,url='https://maxgymbratislava.simplybook.it/v2/invoice/pay/private-token/',ss=new Store()}={}){
 const listeners={},posts=[],attrs={},head=new El('head'),body=new El('body'),bridgePosts=[];let observe;
 const parent=standalone?null:{postMessage:(d,o)=>posts.push({d,o})};
 const window={addEventListener:(k,v)=>(listeners[k]||(listeners[k]=[])).push(v),removeEventListener:(k,v)=>{listeners[k]=(listeners[k]||[]).filter(f=>f!==v)}};window.parent=standalone?window:parent;
 const document={cookie:cookie?'cookies_accepted=yes':'allowCookies=yes',documentElement:{setAttribute:(k,v)=>attrs[k]=v},head,body,getElementById:id=>head.children.find(x=>x.id===id),createElement:t=>{const el=new El(t);if(t==='iframe')el.contentWindow={postMessage:(data,origin)=>bridgePosts.push({data,origin})};return el},referrer:'https://maxgym.sk/rezervacia/'};
 let timers=[];
 const context={window,document,location:{origin:'https://maxgymbratislava.simplybook.it',href:url},URL,Date,Number,sessionStorage:ss,setTimeout:f=>{timers.push(f);return timers.length},clearTimeout(){},require:(names,cb)=>cb({getInstance:()=>({on:(name,fn)=>{assert.equal(name,'perform:event');observe=fn}})})};
 vm.runInNewContext(relay,context);
 const finish=(overrides={},info={payment_processor:'stripe'})=>observe('onFinishPayment',[null,info,{get:k=>({id:42,number:'SI-2026000042',status:'paid',amount:'10.00',currency:'EUR',...overrides})[k]}]);
 const ga=()=>window.dataLayer?window.dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='event'):[];
 return{attrs,posts,ss,finish,ga,context,window,document,bridgePosts,emit:(data,origin,source)=>[...(listeners.message||[])].forEach(fn=>fn({data,origin,source}))};
}
let c=child();assert.equal(c.attrs['data-maxgym-paid-relay'],'7');c.finish({status:'pending'});c.finish({},{payment_processor:'delay'});assert.equal(c.posts.filter(x=>x.d.event==='maxgymPaymentAccepted').length,0);
c.finish();let msg=c.posts.find(x=>x.d.event==='maxgymPaymentAccepted').d;assert.equal(msg.invoiceNumber,'SI-2026000042');assert.equal(msg.amount,10);c.finish();assert.equal(c.posts.filter(x=>x.d.event==='maxgymPaymentAccepted').length,1);
h=host({a:true,m:true});h.send(msg);assert.equal(h.ga()[1][2].value,10,'Paid model to host purchase is linked');
c=child({standalone:true});c.finish();assert.equal(c.ga().filter(x=>x[1]==='purchase').length,1);assert(!JSON.stringify(c.ga()).includes('private-token'));assert.equal(c.ga()[1][2].transaction_id,'SI-2026000042');
c=child({standalone:true,cookie:false});c.finish();assert.equal(c.ga().length,0,'Standalone requires explicit consent');
c=child();vm.runInNewContext(relay,c.context);assert.equal(c.posts.filter(x=>x.d.event==='maxgymMeasurementReady').length,1,'Relay attaches once');
// Reproduce a real redirect: tagged booking entry -> untagged payment return.
const tagged='https://maxgymbratislava.simplybook.it/v2/?utm_source=instagram&utm_medium=paid_social&utm_campaign=maxgym_pro_sparing_03&utm_content=sparing';
let entry=child({standalone:true,url:tagged});
let returned=child({standalone:true,ss:entry.ss}); returned.finish();
assert.equal(returned.ga().find(x=>x[1]==='purchase')[2].mg_campaign,'maxgym_pro_sparing_03','Tagged booking source must survive payment redirect');
assert.equal(returned.ga().find(x=>x[1]==='purchase')[2].mg_content,'sparing');
let refusedEntry=child({standalone:true,cookie:false,url:tagged});
assert.equal(refusedEntry.ss.size,0,'No campaign storage before standalone consent');
let unknown=child({standalone:true}); unknown.finish();
assert.equal(unknown.ga().find(x=>x[1]==='purchase')[2].mg_campaign,'unknown');
let handover=child({standalone:true});
const frame=handover.document.body.children.find(x=>x.tagName==='iframe');
assert.equal(frame.src,'https://maxgym.sk/meranie-potvrdenia/');assert.equal(frame.referrerPolicy,'no-referrer');
const sourceMessage={event:'maxgymBridgeReady',analytics:true,client:'12345.67890',context:{campaign:'maxgym_pro_sparing_03',content:'sparing',source:'instagram',medium:'paid_social',time:Date.now()}};
handover.emit(sourceMessage,'https://foreign.example',frame.contentWindow);
assert.equal(handover.ss.has('maxgym-source-context-v2'),false,'Foreign source rejected');
handover.emit(sourceMessage,'https://maxgym.sk',frame.contentWindow);handover.finish();
assert.equal(handover.ga().find(x=>x[1]==='purchase')[2].mg_campaign,'maxgym_pro_sparing_03');
assert.equal(handover.bridgePosts[0].data.event,'maxgymStandalonePaid');
assert.equal(handover.bridgePosts[0].data.status,'paid');
assert(!JSON.stringify(handover.bridgePosts).includes('private-token'));
let declined=child({standalone:true,cookie:false});assert.equal(declined.document.body.children.length,0,'No bridge iframe without standalone consent');
console.log('PASS: paid model, actual invoice, redirect source continuity, unknown classification, replay deduplication, consent, origins, pending/Pay Later; no production conversions.');
