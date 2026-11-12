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
    origin: 'https://maxgymbratislava.simplybook.it',
    data: { event: 'maxgymPaymentAccepted', reference: 'private-payment-id', email: 'private@example.com' }, ...extra });
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
b.complete({ data: { event: 'bookingDone' } });
b.complete({ data: { event: 'purchase', payment_method: 'pay_later' } });
assert.equal(b.window.dataLayer.length, gaCount, 'Reject unrelated/spoofed completions');
b.complete(); b.complete();
assert.equal(b.window.dataLayer.length, gaCount + 1, 'Count duplicate completion once');
assert.equal(b.window.fbq.queue.length, metaCount + 1);
assert.equal(b.window.dataLayer.at(-1)[1], 'booking_paid');
assert.equal(b.window.dataLayer.at(-1)[2].page_location, 'https://maxgym.sk/rezervacia/?utm_source=instagram');
assert.equal(b.window.fbq.queue.at(-1)[0], 'trackCustom');
assert.equal(b.window.fbq.queue.at(-1)[1], 'PaidBooking');
assert(!JSON.stringify(b.window.dataLayer).includes('private@example.com'));
assert(!JSON.stringify(b.window.fbq.queue).includes('private@example.com'));
assert(!JSON.stringify(b.window.dataLayer).includes('private-payment-id'));
assert(!JSON.stringify(b.window.fbq.queue).includes('private-payment-id'));
b.complete({ data: { event: 'maxgymPaymentAccepted', reference: 'other-payment' } });
assert.equal(b.window.dataLayer.length, gaCount + 2, 'Distinct provider payments count separately');
b.complete({ data: { event: 'maxgymPaymentAccepted' } });
b.complete({ data: { event: 'maxgymPaymentAccepted' } });
assert.equal(b.window.dataLayer.length, gaCount + 3, 'Fallback is once per loaded checkout');
b.click('Nastavenie cookies'); b.click('Odmietnuť nepovinné');
assert.equal(b.reloads(), 1, 'Revocation unloads active libraries');
assert.equal(JSON.parse(b.storage.get('maxgym-consent-v1')).analytics, false);
b = boot(saved(true, true, Date.now() - 181 * 86400000));
assert.equal(b.document.head.children.length, 0, 'Expired consent never loads tracking');
b = boot({ version: 1, time: Date.now(), analytics: 'yes', marketing: true });
assert.equal(b.document.head.children.length, 0, 'Invalid consent fails closed');
b = boot(); b.complete(); b.click('Prijať všetko'); b.complete();
assert.equal(b.window.dataLayer.length, 3, 'Never replay a pre-consent completion');
b = boot(saved(true, false)); b.complete();
assert.equal(b.window.dataLayer.at(-1)[1], 'booking_paid');
assert.equal(b.window.fbq, undefined);
b = boot(saved(false, true)); b.complete();
assert.equal(b.window.fbq.queue.at(-1)[1], 'PaidBooking');
assert.equal(b.window.gtag, undefined);

const relaySource = readFileSync('scripts/simplybook-paid-gtm.html', 'utf8').replace(/<\/?script>/g, '');
function relay(dataLayer, origin = 'https://maxgymbratislava.simplybook.it', embedded = true) {
  const calls = [];
  const window = { dataLayer };
  window.parent = embedded ? {
    postMessage(message, target) { calls.push([JSON.parse(JSON.stringify(message)), target]); }
  } : window;
  vm.runInNewContext(relaySource, { window, location: { origin } });
  return calls;
}
assert.deepEqual(relay([{ event: 'purchase', payment_method: 'pay_later' }]), []);
assert.deepEqual(relay([{ event: 'bookingDone' }]), []);
assert.deepEqual(relay([{ event: 'paymentAccepted', transaction_id: 't-20', email: 'private@example.com' }]),
  [[{ event: 'maxgymPaymentAccepted', reference: 't-20' }, 'https://maxgym.sk']]);
assert.deepEqual(relay([{ event: 'paymentAccepted', transaction_id: 'private@example.com' }]),
  [[{ event: 'maxgymPaymentAccepted' }, 'https://maxgym.sk']]);
assert.deepEqual(relay([{ event: 'paymentAccepted' }], 'https://other.example'), []);
assert.deepEqual(relay([{ event: 'paymentAccepted' }], undefined, false), []);
console.log('PASS: separate consents, source/origin, paid-event relay, URL redaction, payment deduplication and no replay.');
