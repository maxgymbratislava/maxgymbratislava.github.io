const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync('assets/js/payment-bridge.js','utf8');
class Store extends Map { getItem(k){return this.get(k)||null} setItem(k,v){this.set(k,String(v))} }
const choice=(a,m)=>({version:1,analytics:a,marketing:m,time:Date.now()});
function bridge({a=true,m=true,store=new Store(),saved=true,top=false,storageBlocked=false}={}) {
  if(saved)store.setItem('maxgym-consent-v1',JSON.stringify(choice(a,m)));
  const listeners={},sent=[],scripts=[];
  const parent={postMessage:(data,origin)=>sent.push({data,origin})};
  const window={parent,addEventListener:(k,f)=>listeners[k]=f}; if(top)window.parent=window;
  const storage=storageBlocked?{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}:store;
  const document={cookie:'_ga=GA1.1.12345.67890',head:{appendChild:s=>scripts.push(s)},createElement:()=>({})};
  vm.runInNewContext(code,{window,document,location:{origin:'https://maxgym.sk'},localStorage:storage,Date,URL});
  const send=(data,origin='https://maxgymbratislava.simplybook.it',source=parent)=>listeners.message?.({data,origin,source});
  const purchases=()=>window.fbq?.queue.filter(x=>x[0]==='track'&&x[1]==='Purchase')||[];
  return {window,document,store,sent,scripts,send,purchases};
}
// Synthetic fixture only. Real invoice reconciliation stays in the private project audit.
const paid={event:'maxgymStandalonePaid',status:'paid',reference:'fixture-26',invoiceNumber:'SI-TEST-0042',
  processor:'stripe',amount:20,currency:'EUR',email:'never-send@example.com',privateUrl:'/invoice/pay/private-token/'};
let b=bridge();b.send(paid);assert.equal(b.purchases().length,1);
assert.equal(b.purchases()[0][2].value,20);assert.equal(b.purchases()[0][2].order_id,'SI-TEST-0042');
assert.equal(b.purchases()[0][3].eventID,'purchase-fixture-26');
assert(!JSON.stringify(b.window.fbq.queue).includes('private-token'));
assert(!JSON.stringify(b.window.fbq.queue).includes('never-send@'));
b.send(paid);assert.equal(b.purchases().length,1,'Duplicate acknowledgment does not count twice');
b=bridge({store:b.store});b.send(paid);assert.equal(b.purchases().length,0,'Reload deduplication shared with host Pixel');
for(const options of [{a:true,m:false},{a:false,m:false},{saved:false},{storageBlocked:true}]) {
  b=bridge(options);b.send(paid);assert.equal(b.purchases().length,0);assert.equal(b.scripts.length,0);
}
b=bridge({a:false,m:true});b.send(paid);assert.equal(b.purchases().length,1,'Marketing independent of analytics');
assert.equal(b.sent[0].data.client,undefined,'No GA identifier without analytics consent');
b=bridge();b.send(paid,'https://foreign.example');b.send(paid,undefined,{});
b.send({...paid,status:'pending'});b.send({...paid,processor:'delay'});b.send({...paid,amount:0});
b.send({...paid,amount:'20'});b.send({...paid,currency:'eur'});assert.equal(b.purchases().length,0);
b=bridge();b.store.setItem('maxgym-consent-v1',JSON.stringify({...choice(true,true),time:Date.now()-181*86400000}));
b.send(paid);assert.equal(b.purchases().length,0,'Expired consent rejected');
b=bridge({top:true});assert.equal(b.sent.length,0);b.send(paid);assert.equal(b.purchases().length,0);
b=bridge();b.store.setItem('maxgym-source-v1',JSON.stringify({campaign:'maxgym_pro_sparing_03',content:'sparing',
  source:'instagram',medium:'paid_social',time:Date.now(),basis:'tagged_click'}));
b.send({event:'maxgymBridgeHello'});const ready=b.sent.at(-1).data;
assert.equal(ready.context.campaign,'maxgym_pro_sparing_03');assert.equal(ready.client,'12345.67890');
console.log('PASS: category consent, blocked storage, origins, paid-only filtering, duplicate/reload protection, source handover and no private URLs or PII. No network.');
