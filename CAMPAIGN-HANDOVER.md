# October campaign — implementation and publishing status

This branch implements the campaign against GitHub main at `1e75072dee04b1b32a9412b00df621edb7977911`. **Do not deploy it over production before reconciling the newer deployed source.** On October 12, the live site exposed `fr.js?v=20260915-botanical-oils`, a French switch, Botanical Oils labels, and an FAQ that are absent from GitHub main. Cloudflare login through the connected browser returned `API Request Failed … (403)`. Production has not been changed.

## Implemented

- Homepage hero, announcement bar, campaign landing page, two-column mobile/four-column desktop soap selector and awareness section.
- All six original Instagram media downloads plus optimized local WebP assets. No hotlink dependency.
- Shared `promotion.js` calculation imported by storefront and Worker; highest-priced bars pair first; lower-priced pairs never increase in price.
- Bar soaps only; repeat offer for every complete pair. Default $14 per pair and $1 business-funded donation per pair. Repeat-pair donation rule is an assumption requiring owner review before production.
- Toronto date boundaries, automatically ending after October 31, 2026.
- Itemized discounts in cart, checkout, mailto request, saved order snapshots, business receipts and English/French customer receipts.
- Protected campaign settings and donation ledger in existing inventory manager. New tables initialize idempotently in the existing D1 database; no existing tables are replaced.
- Pending, paid, completed, cancelled, full refund and partial refund states. Only paid/completed/partial refund retained pairs contribute to committed totals. No automatic refund or charity transfer occurs.
- Six complete English/French Brevo-ready email drafts; none sent or scheduled. Mailing address placeholder must be replaced before sending. Existing unchecked marketing consent remains optional.

## Editing

After safe integration/deployment, use the existing inventory passcode at `inventory.html`. Under **Soap offer & donation tracker**, edit enabled, dates, pair price and donation amount. Mark orders Paid when money is received; Completed does not double count. For a partial refund enter actual complete pairs retained. Updated status does not send emails.

Page copy is in `october-rose.html`; hero copy is in `campaign-ui.js`. Original defaults and eligibility are in `promotion.js`. Email content and import guidance are in `campaign-emails/README.md`.

## Required before production

1. Retrieve the deployed Worker source and storefront files from Cloudflare and reconcile changes, particularly `fr.js`, FAQ, botanical oil labels, security headers and current checkout behaviour. Preserve the site's existing language system; the fallback language support on this branch must be adapted to it.
2. Review corrected health-graphic drafts and repeat-pair donation terms.
3. Confirm the original D1 and protected Brevo secrets remain bound. New campaign tables should initialize on `/api/campaign`.
4. Run tests and check real desktop/mobile interactions, actual current inventory, language switch and live email previews. No real emails were sent by tests; Brevo requests were mocked.
5. Publish using the current Cloudflare deployment, then verify campaign page, checkout and expiry behaviour. Do not deploy the separate older ChatGPT Site as a replacement for justbnatural.ca.

## Validation

`node --test tests/*.test.js` covers 0–4 eligible bars, same/mixed scents, excluded categories, price variation, low regular prices, date boundaries, cart edits/removal/persistence, trusted database prices despite forged browser totals, matching saved totals and both emails, admin auth and paid/refund commitments. Syntax checks pass. Live browser QA and production deployment remain blocked.

With regular $8 bars: 1=$8, 2=$14, 3=$22, 4=$28. Donation commitments are $0/$1/$1/$2 respectively. Other products and delivery add normally. The existing site does not calculate separate taxes; this change introduces no new tax policy.
