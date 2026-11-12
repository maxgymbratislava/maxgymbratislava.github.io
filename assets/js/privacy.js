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
  let paymentWithoutReferenceCounted = false;
  const countedPayments = new Set();
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
        allow_google_signals: false, allow_ad_personalization_signals: false
      });
      script('https://www.googletagmanager.com/gtag/js?id=' + GA, 'maxgym-ga');
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

  // The SimplyBook GTM tag relays only its successful online payment event.
  window.addEventListener('message', event => {
    const frame = document.querySelector('#maxgym-booking iframe');
    if (!frame || event.source !== frame.contentWindow ||
        event.origin !== 'https://maxgymbratislava.simplybook.it' ||
        !event.data || event.data.event !== 'maxgymPaymentAccepted') return;

    // The optional payment reference is used here only for deduplication.
    const reference = event.data.reference;
    if (typeof reference === 'string' && /^[a-z0-9_-]{1,80}$/i.test(reference)) {
      if (countedPayments.has(reference)) return;
      countedPayments.add(reference);
    } else {
      if (paymentWithoutReferenceCounted) return;
      paymentWithoutReferenceCounted = true;
    }

    if (consent.analytics && gaStarted) window.gtag('event', 'booking_paid', {
      booking_provider: 'simplybook', page_location: cleanLocation()
    });
    if (consent.marketing && metaStarted) window.fbq('trackCustom', 'PaidBooking');
  });

  const clearMeasurementCookies = () => {
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
