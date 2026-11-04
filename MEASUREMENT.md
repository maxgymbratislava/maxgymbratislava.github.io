# MAXGYM measurement — 4 November 2026

## Configuration

- GA4 account `414659018`, property `562274874`, stream `16266573374`.
- Measurement ID `G-CLP2PW76E6` (MAXGYM web + SimplyBook).
- Meta dataset `1122181130227280` (MAXGYM | Web a rezervacie).
- Direct, consent-gated Google tag and Meta Pixel on the 15 public SK/EN pages.
- `booking_complete` is registered as a GA4 key event, with no fabricated monetary value.
- The existing GTM container is not loaded by this implementation. SimplyBook's empty GTM field is intentionally unchanged; no extra paid features are required.

## Consent and booking safety

`privacy.js` loads neither measurement library until its category is accepted. Analytics and advertising can be accepted independently. The choice expires after 180 days. The persistent settings button permits refusal/withdrawal. Withdrawal clears accessible measurement cookies and reloads to unload third-party listeners.

The existing booking widget, booking service/provider IDs, payment settings, webhook, access control and Nuki integration are unchanged. Refusing measurement does not block the booking iframe.

The completion listener accepts only `data.event === 'bookingDone'` from the actual iframe under `#maxgym-booking`, with origin `https://maxgymbratislava.simplybook.it`. It forwards no message payload, personal information, booking ID or entry code. It emits GA4 `booking_complete` and Meta `Schedule` only for the categories consented to at the time of completion. It never emits `Purchase` or claims verified payment/revenue.

SimplyBook documents that `bookingDone` may arrive twice for paid bookings. This listener counts once per parent-page load. Multiple separate bookings without a parent-page reload are consequently counted once. SimplyBook also notes that reschedules/wait-list operations may emit the same signal; these must not be treated as separately verified new paid bookings.

## Checks

Run `node --check assets/js/privacy.js`, `node scripts/test-privacy.cjs`, and `git diff --check`.
The automated test covers no tracking before consent or after refusal, category separation, persisted/expired/malformed choices, URL/referrer redaction, source and origin validation, event deduplication, withdrawal and no retroactive conversion replay.

After deployment, verify the actual banner and booking iframe in SK/EN, page views in the MAXGYM GA4 Realtime report, and Meta Test Events. A real controlled booking is still required to validate delivery of `bookingDone` end to end; synthetic unit messages are not evidence that a production reservation was completed.

## Sources

- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://tech-support.simplybook.me/t/tracking-completed-bookings/2434
- https://help.simplybook.me/wiki/Analytics_tools_integration_guide

## Rollback

Revert this isolated measurement commit and deploy main. This removes the two optional asset links on public pages and stops tracking on subsequent page loads. It does not require changing SimplyBook, DNS, payment processing or door access.
