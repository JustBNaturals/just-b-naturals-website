# Just B Naturals website

This folder is the complete website. Keep every file and the `images`, `functions`, and `tools` folders together.

The checkout uses a simple approval-first system:

1. The customer sends an order request without paying.
2. Just B Naturals checks that the small-batch items are available.
3. The order email includes ready-made buttons to approve the order or say it is unavailable.
4. Only the approval email tells the customer when and how to pay.

This prevents customers from paying for stock that has not been checked. It does not automatically count inventory; Just B Naturals decides which requests to approve.

## Preview it

Open `index.html` in a browser. Product pages, filters, the cart, quantities, order-request layout, cash/e-Transfer preferences, and responsive design work without a server.

When opened as local files, the final button offers a prepared order-request email as a safe fallback. Automatic request receipts and promotional-email collection turn on after the site is published and the email service is connected.

## Turn on live orders and the promotional list

The included Cloudflare Pages Functions are ready to:

- email each order to `justbnaturalss@gmail.com`;
- send the customer a request receipt that clearly says not to pay yet;
- give Just B Naturals simple approve/unavailable email buttons;
- add only customers who actively opt in to the promotional list; and
- email a dated record of each promotional consent.

To connect them:

1. Create a Brevo account and verify the email that will send confirmations.
2. Create a Brevo contact list for promotions.
3. Publish this complete folder with Cloudflare Pages so the `functions` folder is included.
4. Add these environment variables in the Cloudflare Pages project settings:

   - `BREVO_API_KEY` — required
   - `BREVO_SENDER_EMAIL` — the verified sender in Brevo
   - `BREVO_SENDER_NAME` — optional; defaults to `Just B Naturals`
   - `BREVO_LIST_ID` — optional but recommended for the promotions list
   - `ORDER_EMAIL` — optional; defaults to `justbnaturalss@gmail.com`
   - `PAYMENT_EMAIL` — optional; defaults to `ORDER_EMAIL` and is shown only in the approval email for e-Transfer orders

No customer accounts or custom database are required for this version. Orders are reviewed from the Just B Naturals email inbox. A database is only needed later if you want automatic inventory counting or a separate order dashboard.

For the full beginner-friendly publishing process, read `GO-LIVE-CHECKLIST.md`.

## Update products

Product information lives near the top of `script.js` in the `PRODUCTS` list. Each product has a unique `id`, name, description, ingredients, price, image, colours, and category.

If a product is added or removed, update `tools/generate-product-pages.mjs`, then run:

```text
node tools/generate-product-pages.mjs
```

This creates one complete HTML page for every product. Existing products already have their pages in the ZIP.
