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
  const acknowledgements = [];
  const frame = { contentWindow: { postMessage(message, origin) { acknowledgements.push({ message, origin }); } } };
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
    data: { event: 'bookingDone', id: 'private-payment-id', payment_processor: 'stripe', email: 'private@example.com' }, ...extra });
  return { window, document, nodes, click, complete, cookieWrites, storage, frame, acknowledgements, reloads: () => reloads };
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
b.complete({ data: { event: 'bookingDone', id: 100, payment_processor: 'delay' } });
b.complete({ data: { event: 'bookingDone', id: 'private@example.com', payment_processor: 'stripe' } });
b.complete({ data: { event: 'maxgymPaymentAccepted' } });
b.complete({ data: { event: 'purchase', payment_method: 'pay_later' } });
assert.equal(b.window.dataLayer.length, gaCount, 'Reject unrelated/spoofed completions');
b.complete(); b.complete();
b.complete({ data: { event: 'maxgymPaymentAccepted', reference: 'private-payment-id', processor: 'stripe' } });
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
b.complete({ data: { event: 'maxgymPaymentAccepted', reference: '102', processor: 'stripe' } });
b.complete({ data: { event: 'bookingDone', id: 102, payment_processor: 'stripe' } });
assert.equal(b.window.dataLayer.length, gaCount + 2, 'Distinct provider payments count separately');
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
  const window = { dataLayer, addEventListener() {}, removeEventListener() {} };
  window.parent = embedded ? {
    postMessage(message, target) { calls.push([JSON.parse(JSON.stringify(message)), target]); }
  } : window;
  vm.runInNewContext(relaySource, { window, location: { origin }, document: { cookie: '' },
    setTimeout() {}, clearTimeout() {} });
  return calls;
}
assert.deepEqual(relay([{ event: 'purchase', payment_method: 'pay_later' }]), []);
assert.deepEqual(relay([{ event: 'bookingDone' }]), []);
const accepted = { event: 'paymentAccepted', id: 110, payment_processor: 'stripe', email: 'private@example.com' };
const messages = relay([{ event: 'bookingDone' }, accepted]);
assert.deepEqual(messages, [[{ event: 'maxgymPaymentAccepted', reference: '110', processor: 'stripe' }, 'https://maxgym.sk']]);
b = boot(saved(true, false));
b.complete({ data: messages[0][0] });
b.complete({ data: { event: 'bookingDone', id: accepted.id, payment_processor: accepted.payment_processor } });
assert.equal(b.window.dataLayer.filter(entry => entry[1] === 'booking_paid').length, 1);
assert.deepEqual(relay([{ ...accepted, id: 'private@example.com' }]), []);
assert.deepEqual(relay([{ ...accepted, payment_processor: 'delay' }]), []);
assert.deepEqual(relay([{ event: 'paymentAccepted', transaction_id: 'legacy-id' }]), []);
assert.deepEqual(relay([accepted], 'https://other.example'), []);
assert.deepEqual(relay([accepted], undefined, false), []);

// Test the real GTM script without making any network requests or GA4 events.
function standalone(cookie, payments = [accepted], session = new Map()) {
  const scripts = [];
  const document = { cookie, referrer: 'https://maxgym.sk/rezervacia/?private=secret',
    head: { appendChild(script) { scripts.push(script); } },
    createElement() { return {}; }, getElementById(id) { return scripts.find(s => s.id === id); } };
  const window = { dataLayer: [], parent: null }; window.parent = window;
  const context = { window, document, URL, Date,
    location: { origin: 'https://maxgymbratislava.simplybook.it',
      href: 'https://maxgymbratislava.simplybook.it/v2/?utm_source=facebook&utm_medium=paid_social&utm_campaign=maxgym_pro_sparing_03&email=private@example.com#invoice/private-token' },
    sessionStorage: { getItem: key => session.get(key), setItem: (key, value) => session.set(key, value) } };
  for (const payment of payments) {
    window.dataLayer.push(payment);
    vm.runInNewContext(relaySource, context);
  }
  return { scripts, events: window.dataLayer.filter(e => e[0] === 'event'),
    configs: window.dataLayer.filter(e => e[0] === 'config'), session };
}
for (const cookie of ['', 'cookies_accepted=no', 'cookies_accepted=necessary', 'cookies_accepted=yes_fake']) {
  const result = standalone(cookie);
  assert.equal(result.events.length, 0, 'Standalone requires its own explicit consent');
  assert.equal(result.scripts.length, 0);
}
let direct = standalone('other=keep; cookies_accepted=yes', [accepted, accepted]);
assert.equal(direct.events.length, 1, 'Standalone now records a paid event once');
assert.equal(direct.events[0][1], 'booking_paid');
assert.equal(direct.events[0][2].send_to, 'G-CLP2PW76E6');
assert.equal(direct.events[0][2].page_location,
  'https://maxgymbratislava.simplybook.it/v2/?utm_source=facebook&utm_medium=paid_social&utm_campaign=maxgym_pro_sparing_03');
assert.equal(direct.configs[0][2].send_page_view, false);
assert.equal(direct.scripts.length, 1);
assert(!JSON.stringify(direct.events).includes('private'));
assert.equal(standalone('cookies_accepted=yes', [accepted], direct.session).events.length, 0, 'Reload does not duplicate payment');
assert.equal(standalone('cookies_accepted=yes', [{ ...accepted, payment_processor: 'delay' }]).events.length, 0);

// Reproduce a host that is not listening yet, then accepts the retry.
const pendingTimers = [];
const relayListeners = {};
const relayCalls = [];
const relayWindow = { dataLayer: [accepted],
  addEventListener(name, fn) { relayListeners[name] = fn; },
  removeEventListener(name) { delete relayListeners[name]; } };
let hostReady = false;
relayWindow.parent = { postMessage(message, origin) {
  relayCalls.push({ message, origin });
  if (hostReady) relayListeners.message({ source: relayWindow.parent, origin: 'https://maxgym.sk',
    data: { event: 'maxgymPaymentAcknowledged', reference: message.reference } });
} };
vm.runInNewContext(relaySource, { window: relayWindow,
  location: { origin: 'https://maxgymbratislava.simplybook.it' },
  setTimeout(fn) { pendingTimers.push(fn); return pendingTimers.length; }, clearTimeout() {} });
assert.equal(relayCalls.length, 1);
assert.equal(pendingTimers.length, 1, 'Wait for receiver instead of silently losing payment');
hostReady = true;
pendingTimers.shift()();
assert.equal(relayCalls.length, 2);
assert.equal(pendingTimers.length, 0, 'Acknowledgement stops retries');
assert.equal(relayListeners.message, undefined);
b = boot(saved(true, false));
b.complete({ data: messages[0][0] }); b.complete({ data: messages[0][0] });
assert.equal(b.acknowledgements.length, 2, 'Receiver acknowledges duplicate retries');
assert.equal(b.window.dataLayer.filter(e => e[1] === 'booking_paid').length, 1);
b = boot(saved(false, false)); b.complete({ data: messages[0][0] });
assert.equal(b.acknowledgements.length, 1, 'Declined consent is acknowledged without tracking');
assert.equal(b.window.dataLayer, undefined);
console.log('PASS: separate consents, source/origin, paid-event relay, URL redaction, payment deduplication and no replay.');
