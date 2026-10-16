# Just B Naturals business tools

Open `/inventory` and use the existing stock-manager key. The key is never included in public code.

## Daily workflow
- Review new requests in Order overview. A request does not reserve stock. Mark Confirmed when accepting it: the server reserves stock atomically. Mark Paid only after receiving payment; Completed after fulfillment. These updates do not send emails or issue financial refunds.
- A cancellation/full refund only returns stock when Return stock is checked. Partial refunds require manual stock adjustment for returned goods and the actual number of complete soap pairs retained.
- Older orders created before this release remain manual stock adjustments. New orders can print packing slips while fulfillment details are available (90 days, daily cleanup). CSV exports contain totals and statuses, no customer contact details.
- Failed receipts can retry only their missing recipient; no new order is created. A provider acceptance followed by a network/process failure can still require manual email verification.
- Product details lets you enter real weight/volume and low-stock thresholds. Blank sizes are hidden.
- Reviews require a genuine quote, permission and explicit publication. French quotes display only when supplied. No placeholder reviews are published.

## Campaign and email
Existing October campaign dates, pair price and donation settings remain in the stock manager. Complete pairs repeat, including same-scent pairs. Highest-priced bars pair first, leaving the cheapest odd bar at its normal price; never charge more than regular prices. Donation is a business commitment, not a customer surcharge. Verify the repeat-pair assumption with Brigitte.

Email drafts contains the October series plus welcome, new-batch and reorder drafts in English/French. Preview and export HTML after entering the business mailing address. They are not activated, scheduled or sent. In Brevo: verify the sender, import an approved draft, check unsubscribe and sender details, choose only marketing-eligible contacts, send an approved test, then obtain approval for audience/date before launch. Welcome requires verified consent; new-batch requires real available stock; reorder should use completed orders and marketing consent only. Keep transactional receipts separate.

## Shopping and reporting
Soap pages have optional two-soap builders. The shop scent filters combine with existing search/category/sort. Gift combinations use current inventory and prices; wrapping is not promised. Analytics count actions without visitor identifiers, cookies, email or IP storage. They respect DNT/GPC and the privacy-page opt-out. Counts are not unique visitors or conversion rates; confirmed payment statuses are maintained manually.

## Source maintenance
Product content: `product-data.js`; French content: `fr.js`; run `node scripts/build-site.mjs` after changes. Email templates: `scripts/build-marketing.mjs`, then run it to regenerate drafts. Run `node --test tests/*.test.js` before publishing. Cloudflare deploys main using the existing Worker/D1 bindings. Daily cron removes private fulfillment copies older than 90 days; non-contact financial ledger remains. No marketing automation is attached to this cron.

## Remaining business inputs
Real product sizes; permissioned customer reviews with French versions; optional real making/packaging photos; sender postal address; approved email audience and dates. Google Business Profile and Search Console changes require access to the actual accounts and verified business details. No account/profile changes or claims of profile verification were made.
