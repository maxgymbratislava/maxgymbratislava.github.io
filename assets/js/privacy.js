// Optional measurement is loaded only after an explicit, category-specific consent.
(() => {
  'use strict';
  const GA = 'G-CLP2PW76E6';
  const PIXEL = '1122181130227280';
  const KEY = 'maxgym-consent-v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const en = document.documentElement.lang === 'en';
  const copy = en ? {
    title: 'Your privacy', text: 'With your permission, we use Google Analytics to measure website use and Meta Pixel to evaluate advertising and completed bookings. Booking works even if you refuse optional cookies.',
    accept: 'Accept all', reject: 'Reject optional', settings: 'Choose cookies', save: 'Save choices',
    analytics: 'Analytics (Google Analytics)', marketing: 'Advertising (Meta Pixel)',
    necessary: 'Necessary storage is always enabled. Your choice is stored for 180 days.',
    policy: 'Privacy policy', reopen: 'Cookie settings', close: 'Close'
  } : {
    title: 'Vaše súkromie', text: 'S vaším súhlasom používame Google Analytics na meranie návštevnosti a Meta Pixel na vyhodnotenie reklamy a dokončených rezervácií. Rezervácia funguje aj pri odmietnutí nepovinných cookies.',
    accept: 'Prijať všetko', reject: 'Odmietnuť nepovinné', settings: 'Vybrať cookies', save: 'Uložiť výber',
    analytics: 'Analytické (Google Analytics)', marketing: 'Reklamné (Meta Pixel)',
    necessary: 'Nevyhnutné úložisko je vždy povolené. Voľbu uchovávame 180 dní.',
    policy: 'Ochrana osobných údajov', reopen: 'Nastavenie cookies', close: 'Zavrieť'
  };
  let consent = { analytics: false, marketing: false };
  let stored = null;
  try {
    const value = JSON.parse(localStorage.getItem(KEY));
    if (value && value.version === 1 && typeof value.analytics === 'boolean' &&
        typeof value.marketing === 'boolean' && Number.isFinite(value.time) &&
        Date.now() - value.time >= 0 && Date.now() - value.time < MAX_AGE) stored = value;
  } catch (_) { /* Storage refusal never prevents booking. */ }
  if (stored) consent = stored;

  let gaStarted = false;
  let metaStarted = false;
  const countedPayments = new Set();
  const countedPurchases = new Set();
  const SOURCE_KEY = 'maxgym-source-v1';
  const SOURCE_AGE = 30 * 24 * 60 * 60 * 1000;
  let sourceContext = null;
  let gaClient, gaSession;
  const cleanTag = value => typeof value === 'string' && /^[a-z0-9 _.,|:/-]{1,150}$/i.test(value) ? value : '';
  const readSource = () => {
    if (!consent.analytics) return null;
    const params = new URL(location.href).searchParams;
    const campaign = cleanTag(params.get('utm_campaign'));
    if (campaign) {
      sourceContext = { campaign, source: cleanTag(params.get('utm_source')),
        medium: cleanTag(params.get('utm_medium')), content: cleanTag(params.get('utm_content')),
        time: Date.now(), basis: 'tagged_click' };
      try { localStorage.setItem(SOURCE_KEY, JSON.stringify(sourceContext)); } catch (_) {}
    } else {
      try {
        const previous = JSON.parse(localStorage.getItem(SOURCE_KEY));
        if (previous && cleanTag(previous.campaign) && previous.basis === 'tagged_click' &&
            Number.isFinite(previous.time) && Date.now() - previous.time >= 0 &&
            Date.now() - previous.time < SOURCE_AGE) sourceContext = {
          campaign: cleanTag(previous.campaign), source: cleanTag(previous.source),
          medium: cleanTag(previous.medium), content: cleanTag(previous.content),
          time: previous.time, basis: 'tagged_click'
        };
        else { sourceContext = null; localStorage.removeItem(SOURCE_KEY); }
      } catch (_) { sourceContext = null; }
    }
    return sourceContext;
  };
  const attribution = () => {
    if (!sourceContext || Date.now() - sourceContext.time >= SOURCE_AGE) return {
      mg_attribution: 'unknown', mg_campaign: 'unknown', mg_content: 'unknown'
    };
    return { mg_attribution: 'tagged_click_30d', mg_campaign: sourceContext.campaign,
      mg_content: sourceContext.content || 'unknown', mg_source: sourceContext.source || 'unknown',
      mg_medium: sourceContext.medium || 'unknown' };
  };
  const sendContext = () => {
    if (!consent.analytics) return;
    const frame = document.querySelector('#maxgym-booking iframe');
    if (frame) frame.contentWindow.postMessage({ event: 'maxgymMeasurementContext',
      analytics: true, context: sourceContext, client: gaClient, session: gaSession,
      issued: Date.now() }, 'https://maxgymbratislava.simplybook.it');
    if (sourceContext) document.querySelectorAll('a[href]').forEach(link => {
      try {
        const url = new URL(link.href);
        if (url.origin !== 'https://maxgymbratislava.simplybook.it') return;
        for (const key of ['source', 'medium', 'campaign', 'content']) {
          if (sourceContext[key]) url.searchParams.set('utm_' + key, sourceContext[key]);
        }
        link.href = url.href;
      } catch (_) {}
    });
  };
  const cleanLocation = () => {
    const url = new URL(location.href);
    const clean = new URL(url.origin + url.pathname);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      const value = url.searchParams.get(key);
      if (value && value.length <= 150 && !value.includes('@')) clean.searchParams.set(key, value);
    });
    return clean.href;
  };
  const script = (src, id) => {
    if (document.getElementById(id)) return;
    const element = document.createElement('script');
    element.id = id; element.async = true; element.src = src;
    document.head.append(element);
  };
  const apply = () => {
    if (consent.analytics && !gaStarted) {
      readSource();
      gaStarted = true;
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
      window.gtag('consent', 'default', {
        analytics_storage: 'granted', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      window.gtag('js', new Date());
      window.gtag('config', GA, {
        page_location: cleanLocation(), page_referrer: document.referrer.split('?')[0].split('#')[0],
        linker: { domains: ['maxgymbratislava.simplybook.it'] },
        allow_google_signals: false, allow_ad_personalization_signals: false
      });
      script('https://www.googletagmanager.com/gtag/js?id=' + GA, 'maxgym-ga');
      window.gtag('get', GA, 'client_id', value => {
        if (typeof value === 'string' && /^\d+\.\d+$/.test(value)) gaClient = value;
        sendContext();
      });
      window.gtag('get', GA, 'session_id', value => {
        if (/^\d{1,16}$/.test(String(value))) gaSession = String(value);
        sendContext();
      });
    }
    if (consent.marketing && !metaStarted) {
      metaStarted = true;
      if (!window.fbq) {
        const fbq = function () {
          if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
          else fbq.queue.push(arguments);
        };
        fbq.push = fbq; fbq.loaded = true; fbq.version = '2.0'; fbq.queue = [];
        window.fbq = fbq; window._fbq = fbq;
      }
      window.fbq('consent', 'grant');
      window.fbq('set', 'autoConfig', false, PIXEL);
      window.fbq('init', PIXEL);
      window.fbq('track', 'PageView');
      script('https://connect.facebook.net/en_US/fbevents.js', 'maxgym-meta');
    }
  };

  // SimplyBook's paid confirmation and the GTM relay carry the same invoice ID.
  window.addEventListener('message', event => {
    const frame = document.querySelector('#maxgym-booking iframe');
    if (!frame || event.source !== frame.contentWindow ||
        event.origin !== 'https://maxgymbratislava.simplybook.it' || !event.data) return;

    const message = event.data;
    if (message.event === 'maxgymMeasurementReady') { sendContext(); return; }
    let reference, processor;
    if (message.event === 'bookingDone') {
      reference = message.id;
      processor = message.payment_processor;
    } else if (message.event === 'maxgymPaymentAccepted') {
      reference = message.reference;
      processor = message.processor;
    } else return;

    // A generic bookingDone carries neither field. Pay Later uses the delay processor.
    if (typeof processor !== 'string' || !/^[a-z0-9_-]{1,60}$/i.test(processor) ||
        /^(delay|pay_later|paylater|cash|manual|free|onsite|offline)$/i.test(processor)) return;
    if (Number.isSafeInteger(reference) && reference > 0) reference = String(reference);
    if (typeof reference !== 'string' || !/^[a-z0-9_-]{1,80}$/i.test(reference)) return;

    // Acknowledge even a duplicate or a declined measurement choice. The sender
    // retries briefly when the host page is still loading after a payment return.
    if (message.event === 'maxgymPaymentAccepted') frame.contentWindow.postMessage({
      event: 'maxgymPaymentAcknowledged', reference
    }, event.origin);
    const transaction = typeof message.invoiceNumber === 'string' &&
      /^[a-z0-9_-]{1,80}$/i.test(message.invoiceNumber) ? message.invoiceNumber : 'SB-' + reference;
    const payload = { booking_provider: 'simplybook', transaction_id: transaction,
      invoice_id: reference, page_location: cleanLocation(), ...attribution() };
    const mark = channel => {
      const key = channel + '-' + reference;
      if (countedPayments.has(key)) return false;
      try { if (localStorage.getItem('maxgym-paid-v2-' + key)) return false; } catch (_) {}
      countedPayments.add(key);
      try { localStorage.setItem('maxgym-paid-v2-' + key, String(Date.now())); } catch (_) {}
      return true;
    };
    if (consent.analytics && gaStarted && mark('ga')) window.gtag('event', 'booking_paid', payload);
    if (consent.marketing && metaStarted && mark('meta')) window.fbq('trackCustom', 'PaidBooking',
      { transaction_id: transaction }, { eventID: 'paid-' + reference });

    // Value is supplied by SimplyBook's paid invoice model, never inferred from a price list.
    if (message.event !== 'maxgymPaymentAccepted' || typeof message.amount !== 'number' ||
        !Number.isFinite(message.amount) || message.amount <= 0 || message.amount > 100000 ||
        typeof message.currency !== 'string' || !/^[A-Z]{3}$/.test(message.currency)) return;
    const purchase = { ...payload, currency: message.currency, value: message.amount,
      items: [{ item_id: 'maxgym-booking', item_name: 'MAXGYM rezervacia',
        price: message.amount, quantity: 1 }] };
    if (consent.analytics && gaStarted && !countedPurchases.has('ga-' + reference) && mark('ga-purchase')) {
      countedPurchases.add('ga-' + reference);
      window.gtag('event', 'purchase', purchase);
    }
    if (consent.marketing && metaStarted && !countedPurchases.has('meta-' + reference) && mark('meta-purchase')) {
      countedPurchases.add('meta-' + reference);
      window.fbq('track', 'Purchase', { value: message.amount, currency: message.currency,
        order_id: transaction }, { eventID: 'purchase-' + reference });
    }
  });

  const clearMeasurementCookies = () => {
    try {
      localStorage.removeItem(SOURCE_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('maxgym-paid-v2-')) localStorage.removeItem(key);
      }
    } catch (_) {}
    document.cookie.split(';').forEach(part => {
      const name = part.split('=')[0].trim();
      if (!/^(_ga(?:_|$)|_gid$|_gat|_fbp$|_fbc$)/.test(name)) return;
      ['', location.hostname, '.' + location.hostname, '.maxgym.sk'].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    });
  };

  const panel = document.createElement('section');
  panel.className = 'mg-consent'; panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-labelledby', 'mg-consent-title');
  panel.hidden = Boolean(stored);
  const title = document.createElement('h2'); title.id = 'mg-consent-title'; title.textContent = copy.title;
  const text = document.createElement('p'); text.textContent = copy.text;
  const policy = document.createElement('a'); policy.href = '/ochrana-osobnych-udajov/#meranie'; policy.textContent = copy.policy;
  const choices = document.createElement('div'); choices.className = 'mg-consent-choices'; choices.hidden = true;
  const checkbox = (key, label) => {
    const row = document.createElement('label');
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = consent[key];
    row.append(input, document.createTextNode(label)); choices.append(row); return input;
  };
  const analytics = checkbox('analytics', copy.analytics);
  const marketing = checkbox('marketing', copy.marketing);
  const notice = document.createElement('p'); notice.textContent = copy.necessary; choices.append(notice);
  const buttons = document.createElement('div'); buttons.className = 'mg-consent-actions';
  const button = (label, action) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.addEventListener('click', action); buttons.append(b); return b;
  };
  const persist = (a, m) => {
    const revoked = (consent.analytics && !a) || (consent.marketing && !m);
    consent = { version: 1, analytics: a, marketing: m, time: Date.now() };
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch (_) {}
    panel.hidden = true;
    if (revoked) {
      if (window.fbq) window.fbq('consent', 'revoke');
      clearMeasurementCookies();
      // Unload third-party libraries rather than leaving active listeners after withdrawal.
      location.reload(); return;
    }
    apply(); reopen.focus();
    sendContext();
  };
  button(copy.reject, () => persist(false, false));
  button(copy.accept, () => persist(true, true));
  const settings = button(copy.settings, () => {
    choices.hidden = false; save.hidden = false; settings.hidden = true; analytics.focus();
  });
  const save = button(copy.save, () => persist(analytics.checked, marketing.checked)); save.hidden = true;
  panel.append(title, text, policy, choices, buttons);
  const reopen = document.createElement('button'); reopen.type = 'button';
  reopen.className = 'mg-consent-reopen'; reopen.textContent = copy.reopen;
  reopen.addEventListener('click', () => {
    analytics.checked = consent.analytics; marketing.checked = consent.marketing;
    panel.hidden = false; choices.hidden = false; save.hidden = false; settings.hidden = true;
    analytics.focus();
  });
  document.body.append(panel, reopen);
  if (!stored) clearMeasurementCookies();
  apply();
})();
