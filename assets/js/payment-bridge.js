// Optional measurement only. No booking, payment, access-code or customer API calls.
(() => {
  'use strict';
  const SB = 'https://maxgymbratislava.simplybook.it';
  const PIXEL = '1122181130227280';
  const AGE = 180 * 86400000;
  const counted = new Set();
  if (location.origin !== 'https://maxgym.sk' || window.parent === window) return;
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } };
  const consent = () => {
    const c = read('maxgym-consent-v1');
    return c && c.version === 1 && Number.isFinite(c.time) && Date.now() >= c.time &&
      Date.now() - c.time < AGE && typeof c.analytics === 'boolean' && typeof c.marketing === 'boolean'
      ? c : {analytics: false, marketing: false};
  };
  const tag = s => typeof s === 'string' && /^[a-z0-9 _.,|:/-]{1,150}$/i.test(s) ? s : '';
  const ready = () => {
    const c = consent();
    const result = {event: 'maxgymBridgeReady', analytics: c.analytics, marketing: c.marketing};
    if (c.analytics) {
      const source = read('maxgym-source-v1');
      if (source && source.basis === 'tagged_click' && tag(source.campaign) && Number.isFinite(source.time) &&
          Date.now() >= source.time && Date.now() - source.time < 30 * 86400000) {
        result.context = {campaign: tag(source.campaign), content: tag(source.content),
          source: tag(source.source), medium: tag(source.medium), time: source.time, basis: 'tagged_click'};
      }
      const match = document.cookie.match(/(?:^|;\s*)_ga=GA\d+\.\d+\.(\d+\.\d+)(?:;|$)/);
      if (match) result.client = match[1];
    }
    window.parent.postMessage(result, SB);
  };
  window.addEventListener('message', event => {
    if (event.origin !== SB || event.source !== window.parent || !event.data) return;
    const p = event.data;
    if (p.event === 'maxgymBridgeHello') { ready(); return; }
    if (p.event !== 'maxgymStandalonePaid' || p.status !== 'paid' ||
        typeof p.reference !== 'string' || !/^[a-z0-9_-]{1,80}$/i.test(p.reference) ||
        typeof p.invoiceNumber !== 'string' || !/^[a-z0-9_-]{1,80}$/i.test(p.invoiceNumber) ||
        typeof p.processor !== 'string' || !/^[a-z0-9_-]{1,60}$/i.test(p.processor) ||
        /^(delay|pay_later|paylater|cash|manual|free|onsite|offline)$/i.test(p.processor) ||
        typeof p.amount !== 'number' || !Number.isFinite(p.amount) || p.amount <= 0 || p.amount > 100000 ||
        typeof p.currency !== 'string' || !/^[A-Z]{3}$/.test(p.currency)) return;
    const ack = () => window.parent.postMessage({event: 'maxgymBridgeAcknowledged', reference: p.reference}, SB);
    // The host's explicit advertising choice is authoritative; no consent is inferred from a URL.
    if (!consent().marketing) { ack(); return; }
    const key = 'maxgym-paid-v2-meta-purchase-' + p.reference;
    try { if (localStorage.getItem(key)) { ack(); return; } } catch (_) {}
    if (counted.has(key)) { ack(); return; }
    try {
      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments); else fbq.queue.push(arguments);
        };
        fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
        window.fbq = fbq; window._fbq = fbq;
        window.fbq('consent', 'grant'); window.fbq('set', 'autoConfig', false, PIXEL);
        window.fbq('init', PIXEL);
        const script = document.createElement('script'); script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js'; document.head.appendChild(script);
      }
      window.fbq('track', 'Purchase', {value: p.amount, currency: p.currency, order_id: p.invoiceNumber},
        {eventID: 'purchase-' + p.reference});
      counted.add(key);
      try { localStorage.setItem(key, String(Date.now())); } catch (_) {}
      ack();
    } catch (_) { /* Never interfere with the booking or payment page. */ }
  });
  ready();
})();
