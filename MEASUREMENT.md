# MAXGYM measurement

## Configuration

- GA4 account `414659018`, property `562274874`, stream `16266573374`.
- Measurement ID `G-CLP2PW76E6` (MAXGYM web + SimplyBook).
- Meta dataset `1122181130227280` (MAXGYM | Web a rezervacie).
- Direct, consent-gated Google tag and Meta Pixel on the 15 public SK/EN pages.
- The website still loads GA4 and Meta independently. GTM `GTM-WX4BWFQM` belongs to the SimplyBook widget only.
- The paid signal is `booking_paid` in GA4 and the custom `PaidBooking` event in Meta.

## Consent and booking safety

`privacy.js` loads neither measurement library until its category is accepted. Analytics and advertising can be accepted independently. The choice expires after 180 days. The persistent settings button permits refusal/withdrawal. Withdrawal clears accessible measurement cookies and reloads to unload third-party listeners.

The existing booking widget, booking service/provider IDs, payment settings, webhook, access control and Nuki integration are unchanged. Refusing measurement does not block the booking iframe.

SimplyBook documents `paymentAccepted` for successful online payment. Configure the Custom HTML tag in `scripts/simplybook-paid-gtm.html` to run on that exact event. It only posts to `https://maxgym.sk` from the SimplyBook iframe. The parent accepts messages only from the actual iframe under `#maxgym-booking` and the configured SimplyBook origin. GA4 uses the tagged landing-page URL, and Meta uses the Pixel on the original site. The parent uses any valid payment reference only to deduplicate within the page. The analytics events omit booking identifiers, names, entry codes and monetary values. If SimplyBook sends no reference, only one paid event is counted per page load.

The generic `bookingDone` and `purchase` signals are ignored. A `bookingDone` with a validated invoice ID and online processor is accepted, and deduplicated with the GTM `paymentAccepted` relay. SimplyBook's generic purchase signal can include Pay Later.

The relay retries for up to five seconds until the host acknowledges the payment reference, including when measurement was declined. This covers a host listener that is still loading after a payment return. The acknowledgement itself does not transmit an analytics event.

For standalone SimplyBook payments, the same `paymentAccepted` tag now sends `booking_paid` directly to this GA4 property only when SimplyBook's `cookies_accepted` cookie is exactly `yes`. The `allowCookies` flag is insufficient because it can also mean a disabled cookie banner. No native Google Analytics plugin is enabled. Standalone events exclude personal fields, payment references, the URL fragment and unapproved query parameters. A session-scoped invoice reference prevents repeats. The host Google tag enables Google's cross-domain linker for the existing SimplyBook links. Attribution still depends on consent, successful browser return and incoming linker/campaign context.

## Checks

Run `node --check assets/js/privacy.js`, `node scripts/test-privacy.cjs`, and `git diff --check`.
The automated test covers no tracking before consent or after refusal, category separation, persisted/expired/malformed choices, URL/referrer redaction, source and origin validation, event deduplication, withdrawal and no retroactive conversion replay.

Before marking the integration verified, check that SimplyBook emits `paymentAccepted` into GTM with the current feature settings. Open the tagged website booking page, confirm that both diagnostics show only the expected page activity before payment, and compare one successful payment with the SimplyBook status and the paid event in both GA4 and Meta. Check that campaign tags survive checkout and that returning to the confirmation does not duplicate the paid event. Keep SimplyBook's native GA and Meta tags out of this configuration unless their necessity and consent behavior are verified separately.

17 November 2026 correction was tested offline against the public SimplyBook `paymentAccepted` payload (`id`, `payment_processor`). Tests cover the formerly excluded standalone case, missing/declined/necessary-only consent, duplicate messages and reloads, invalid origins, Pay Later and delayed receiver acknowledgement. These tests make no network requests and do not create real GA4 conversions. The production payment acceptance still requires observation of the next real consenting payment. Historical individual consent and route cannot be reconstructed from the invoice list.

## Sources

- https://developers.google.com/tag-platform/security/concepts/consent-mode
- https://tech-support.simplybook.me/t/tracking-completed-bookings/2434
- https://help.simplybook.me/wiki/Analytics_tools_integration_guide

## Rollback

Revert this isolated measurement commit and deploy main. This removes the two optional asset links on public pages and stops tracking on subsequent page loads. It does not require changing SimplyBook, DNS, payment processing or door access.
