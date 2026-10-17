# Shopping improvements — October 17, 2026

- Product pages show a mobile purchase bar once the main purchase panel has scrolled away. It uses live stock/prices and offers the existing one-time stock alert for unavailable items.
- Adding a product shows an accessible “Added ✓” confirmation with a checkout link. Existing recommendations and delivery progress use the same trusted inventory and promotion calculations.
- Homepage delivery information matches checkout: free Aylmer pickup, $10 delivery within 20 km, free from $75 after discounts.
- Shop-wide testimonials appear on product/catalogue pages only when genuine reviews have permission and are published. `/reviews.html` is a private editor using the existing inventory password. It is excluded from search and public navigation. Quotes are rendered as text; French pages show only reviews with a French translation. Nothing is fabricated if there are no reviews.
- Stock-alert requests require an unchecked consent box and server-side consent validation, without joining marketing lists. Existing alert fulfillment remains in place.
- Checkout-only code is in `checkout-ui.js` and is imported only on checkout; all totals still use the shared pricing system. Failed requests retain the cart and retry key.
- Mobile soap, scrub and roller category banners use smaller local WebP variants (same framing). Desktop images are unchanged.
- `styles.css` remains the editable source. Run `node scripts/optimize-assets.mjs` after styling changes to rebuild `styles.min.css` and versioned page references; the metadata builder also invokes this step. Conservative compaction preserves rule order and quoted strings. No new dependencies, external widgets or trackers.

Validation: `node --test tests/*.test.js` (27 tests), syntax checks and `git diff --check`. Includes retry/consent/review access regressions. No real orders or emails sent by verification. Live mobile-device performance scores have not been measured.
