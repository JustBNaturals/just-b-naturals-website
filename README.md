# Just B Naturals website

This is the complete Cloudflare Workers version of the Just B Naturals website.

The `public` folder contains the complete storefront and all 25 images. The `worker` and `functions` folders handle order requests, customer receipts, inventory-confirmation emails, and promotional-email signup.

## Cloudflare deployment settings

- Project name: `just-b-naturals-website`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Non-production builds: optional

The included `wrangler.jsonc` tells Cloudflare exactly what to publish. Do not move or rename the `public`, `worker`, or `functions` folders.

## Required live email settings

After the first deployment, add these under the Cloudflare Worker's **Settings > Variables and Secrets**:

- `BREVO_API_KEY` — required secret
- `BREVO_SENDER_EMAIL` — required verified Brevo sender
- `BREVO_SENDER_NAME` — `Just B Naturals`
- `BREVO_LIST_ID` — recommended for the promotional list
- `ORDER_EMAIL` — `justbnaturalss@gmail.com`
- `PAYMENT_EMAIL` — the address that receives e-Transfers

Never place the Brevo API key in GitHub or any website file.

The customer sends an order request without paying. Just B Naturals checks availability first, then sends the prepared confirmation and payment instructions. No customer accounts or database are required for this version.

See `GO-LIVE-CHECKLIST.md` for the remaining setup steps.
