# October campaign — published October 12, 2026

The October campaign now incorporates the public storefront recovered from justbnatural.ca on October 12: existing fr.js language support, FAQ, current product details, Botanical Oils labels, updated images, and local delivery terms ($10 within 20 km, free from $50 after discounts). Published through the existing GitHub-to-Cloudflare integration after merging PR #1. The live homepage popup, campaign page, French translations, FAQ and enabled promotion API were verified. Cloudflare email sign-in still returns HTTP 403 in the connected browser. No marketing emails have been sent. Worker source is not publicly served; existing server integrations are retained from the repository, with delivery calculations aligned to the recovered checkout.

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

After deployment, use the existing inventory passcode at `inventory.html`. Under **Soap offer & donation tracker**, edit enabled, dates, pair price and donation amount. Mark orders Paid when money is received; Completed does not double count. For a partial refund enter actual complete pairs retained. Updated status does not send emails.

Page copy is in `october-rose.html`; hero copy is in `campaign-ui.js`. Original defaults and eligibility are in `promotion.js`. Email content and import guidance are in `campaign-emails/README.md`.

## Remaining owner review

1. Public storefront reconciliation is complete. Confirm the deployment uses the existing Worker bindings and secrets; current deployed Worker source could not be retrieved publicly.
2. Review corrected health-graphic drafts and repeat-pair donation terms.
3. Confirm the original D1 and protected Brevo secrets remain bound. New campaign tables should initialize on `/api/campaign`.
4. Run tests and check real desktop/mobile interactions, actual current inventory, language switch and live email previews. No real emails were sent by tests; Brevo requests were mocked.
5. Publish using the current Cloudflare deployment, then verify campaign page, checkout and expiry behaviour. Do not deploy the separate older ChatGPT Site as a replacement for justbnatural.ca.

## Validation

`node --test tests/*.test.js` covers 0–4 eligible bars, same/mixed scents, excluded categories, price variation, low regular prices, date boundaries, cart edits/removal/persistence, trusted database prices despite forged browser totals, matching saved totals and both emails, admin auth and paid/refund commitments. Eight tests and syntax checks pass. Production deployment is verified, including live English/French content, popup image loading, FAQ and campaign API settings. Mobile viewport and full browser checkout interactions remain unverified because the connected browser restricts interactions after credential delivery. No real test orders or emails were sent.

With regular $8 bars: 1=$8, 2=$14, 3=$22, 4=$28. Donation commitments are $0/$1/$1/$2 respectively. Other products and delivery add normally. The existing site does not calculate separate taxes; this change introduces no new tax policy.
