const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = readFileSync('assets/js/privacy.js', 'utf8');
class Element {
  constructor(tag) { this.tagName = tag; this.children = []; this.events = {}; this.hidden = false; }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this[name] = value; }
  addEventListener(event, callback) { this.events[event] = callback; }
  focus() {}
  click() { this.events.click(); }
}
function boot(saved) {
  const nodes = []; const listeners = {}; const cookieWrites = [];
  const storage = new Map(saved ? [['maxgym-consent-v1', JSON.stringify(saved)]] : []);
  const frame = { contentWindow: {} };
  const document = { documentElement: { lang: 'sk' }, head: new Element('head'), body: new Element('body'),
    referrer: 'https://example.com/?email=private@example.com',
    createElement(tag) { const el = new Element(tag); nodes.push(el); return el; },
    createTextNode(text) { return { textContent: text }; },
    getElementById(id) { return nodes.find(n => n.id === id && document.head.children.includes(n)); },
    querySelector(selector) { return selector === '#maxgym-booking iframe' ? frame : null; }
  };
  Object.defineProperty(document, 'cookie', { get: () => '_ga=old; _fbp=old; session=keep', set: v => cookieWrites.push(v) });
  let reloads = 0;
  const location = { href: 'https://maxgym.sk/rezervacia/?email=private@example.com&utm_source=instagram#private',
    hostname: 'maxgym.sk', reload() { reloads++; } };
  const window = { addEventListener(name, callback) { listeners[name] = callback; } };
  const context = { window, document, location, URL, Date, localStorage: {
    getItem: key => storage.get(key) || null, setItem: (k, v) => storage.set(k, v)
  }};
  vm.runInNewContext(source, context);
  const click = label => { const b = nodes.find(n => n.tagName === 'button' && n.textContent === label); assert(b); b.click(); };
  const complete = (extra = {}) => listeners.message({ source: frame.contentWindow,
    origin: 'https://maxgymbratislava.simplybook.it', data: { event: 'bookingDone', email: 'private@example.com' }, ...extra });
  return { window, document, nodes, click, complete, cookieWrites, storage, frame, reloads: () => reloads };
}
const saved = (analytics, marketing, time = Date.now()) => ({ version: 1, analytics, marketing, time });
let b = boot();
assert.equal(b.document.head.children.length, 0, 'No scripts before consent');
b.click('Odmietnuť nepovinné');
assert.equal(b.document.head.children.length, 0, 'No scripts after rejection');
assert.equal(b.cookieWrites.some(v => v.startsWith('session=')), false, 'Essential session retained');
b = boot(); b.click('Vybrať cookies');
b.nodes.find(n => n.tagName === 'input').checked = true;
b.click('Uložiť výber');
assert.equal(b.document.head.children.length, 1, 'Analytics only loads one library');
assert(b.document.head.children[0].src.includes('gtag/js'));
assert.equal(b.window.fbq, undefined);
const gaConfig = Array.from(b.window.dataLayer[2]);
assert.equal(gaConfig[2].page_location, 'https://maxgym.sk/rezervacia/?utm_source=instagram');
assert.equal(gaConfig[2].page_referrer, 'https://example.com/');
b = boot(saved(false, true));
assert.equal(b.document.head.children.length, 1);
assert(b.document.head.children[0].src.includes('fbevents.js'));
assert.equal(b.window.gtag, undefined);
b = boot(); b.click('Prijať všetko');
assert.equal(b.document.head.children.length, 2);
const gaCount = b.window.dataLayer.length;
const metaCount = b.window.fbq.queue.length;
b.complete({ origin: 'https://evil.example' });
b.complete({ source: {} });
b.complete({ data: { event: 'stepChanged' } });
assert.equal(b.window.dataLayer.length, gaCount, 'Reject unrelated/spoofed completions');
b.complete(); b.complete();
assert.equal(b.window.dataLayer.length, gaCount + 1, 'Count duplicate completion once');
assert.equal(b.window.fbq.queue.length, metaCount + 1);
assert.equal(b.window.dataLayer.at(-1)[1], 'booking_complete');
assert.equal(b.window.fbq.queue.at(-1)[1], 'Schedule');
assert(!JSON.stringify(b.window.dataLayer).includes('private@example.com'));
assert(!JSON.stringify(b.window.fbq.queue).includes('private@example.com'));
b.click('Nastavenie cookies'); b.click('Odmietnuť nepovinné');
assert.equal(b.reloads(), 1, 'Revocation unloads active libraries');
assert.equal(JSON.parse(b.storage.get('maxgym-consent-v1')).analytics, false);
b = boot(saved(true, true, Date.now() - 181 * 86400000));
assert.equal(b.document.head.children.length, 0, 'Expired consent never loads tracking');
b = boot({ version: 1, time: Date.now(), analytics: 'yes', marketing: true });
assert.equal(b.document.head.children.length, 0, 'Invalid consent fails closed');
b = boot(); b.complete(); b.click('Prijať všetko'); b.complete();
assert.equal(b.window.dataLayer.length, 3, 'Never replay a pre-consent completion');
console.log('PASS: consent gating, separate categories, persistence/expiry, URL redaction, source/origin checks, completion deduplication, withdrawal and no replay.');
