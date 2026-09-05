# Just B Naturals — go-live checklist

## 1. Replace the files in GitHub

1. Unzip the complete updated ZIP.
2. Open the `JustBNaturals/just-b-naturals-website` repository in GitHub.
3. Delete the old website files from the repository.
4. Choose **Add file > Upload files**.
5. Open the unzipped folder and upload everything inside it—not the ZIP itself and not an extra outer folder.
6. Confirm that `public`, `worker`, `functions`, `tools`, `wrangler.jsonc`, `package.json`, `README.md`, and `GO-LIVE-CHECKLIST.md` are visible at the repository's top level.
7. Commit the upload directly to the `main` branch.

## 2. Deploy from the Cloudflare screen

Use the combined **Workers & Pages** setup screen that shows the GitHub repository.

- Repository: `JustBNaturals/just-b-naturals-website`
- Project name: `just-b-naturals-website`
- Build command: leave blank
- Deploy command: `npx wrangler deploy`
- Builds for non-production branches: either setting is fine

Choose **Deploy**. When it finishes, open the temporary `workers.dev` address and confirm that the home page and images appear.

## 3. Connect live order emails

1. Create or sign in to Brevo.
2. Verify the email address that will send the website messages.
3. Create a Brevo API key and keep it private.
4. Create a contact list for promotions and note its list ID.
5. In Cloudflare, open `just-b-naturals-website`, then **Settings > Variables and Secrets**.
6. Add:

   - `BREVO_API_KEY` as a secret
   - `BREVO_SENDER_EMAIL` as the verified Brevo sender
   - `BREVO_SENDER_NAME` as `Just B Naturals`
   - `BREVO_LIST_ID` as the promotions list number
   - `ORDER_EMAIL` as `justbnaturalss@gmail.com`
   - `PAYMENT_EMAIL` as the address that should receive e-Transfers

7. Save the settings and redeploy if Cloudflare asks.

## 4. Test before sharing the website

1. Add one product to the cart and submit a test order using your own customer email.
2. Confirm that `justbnaturalss@gmail.com` receives the order.
3. Confirm that the customer receives a receipt saying not to pay yet.
4. Use the approval button in the business email and send the prepared confirmation.
5. Test the unavailable button and promotional signup once.

## 5. Connect `justbnatural.ca`

1. Open the deployed Worker in Cloudflare.
2. Open **Settings > Domains & Routes**.
3. Choose **Add > Custom Domain**.
4. Enter `justbnatural.ca` and confirm it.
5. Add `www.justbnatural.ca` too if desired.
6. Wait until Cloudflare shows the domain as active, then test it on a phone and computer.

Cloudflare will not appear in the public domain name. Customers will use `justbnatural.ca`.
