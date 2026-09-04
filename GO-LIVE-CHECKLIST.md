# Just B Naturals — simple go-live checklist

This is the easiest setup for the website as it is currently built.

## What you need

- A free GitHub account to hold the website files.
- A free Cloudflare account to put the website online.
- A Brevo account to send order emails and hold the optional promotions list.
- A domain name, purchased yearly. The website hosting itself should fit comfortably on Cloudflare's free plan for a small business.

No customer accounts or website database are needed for this approval-first version.

## 1. Put the website on GitHub

1. Unzip the complete website ZIP.
2. Sign in to GitHub and create a new repository. A private repository is fine.
3. Name it something simple, such as `just-b-naturals-website`.
4. Upload everything inside the unzipped website folder.
5. Check that `index.html`, `styles.css`, `script.js`, the `images` folder, and the `functions` folder are all visible at the top level of the repository. Do not upload only the ZIP file and do not leave everything inside an extra nested folder.
6. Save or commit the upload.

GitHub becomes the master copy. Later, upload changed files or replace the repository contents and Cloudflare will publish the update automatically.

## 2. Publish it with Cloudflare Pages

1. Sign in to Cloudflare.
2. Go to **Workers & Pages**.
3. Choose **Create application**, then **Pages**, then **Import an existing Git repository** or **Connect to Git**.
4. Connect GitHub and select the website repository.
5. Use these settings:

   - Production branch: `main`
   - Framework preset: `None`
   - Build command: `exit 0`
   - Build output directory: `.`

6. Start the deployment.
7. Cloudflare will give you a temporary address ending in `.pages.dev`. At this point, you can open the website from any phone or computer.

The complete `functions` folder must be in GitHub. It is what safely sends the order and signup emails without exposing the private email-service key.

## 3. Connect the order emails

1. Create or sign in to a Brevo account.
2. Add and verify the email address that will send the messages.
3. Create an API key in Brevo and copy it somewhere private.
4. Create a contact list for promotions and note its list ID.
5. In Cloudflare, open the Pages project, then open **Settings** and find **Variables and Secrets** or **Environment variables**.
6. Add these values for Production:

   - `BREVO_API_KEY` — add as a secret; paste the Brevo API key
   - `BREVO_SENDER_EMAIL` — the sender address verified in Brevo
   - `BREVO_SENDER_NAME` — `Just B Naturals`
   - `BREVO_LIST_ID` — the number for the Brevo promotions list
   - `ORDER_EMAIL` — `justbnaturalss@gmail.com`
   - `PAYMENT_EMAIL` — the address that should receive e-Transfers; it may be the same as the order email

7. Save the variables and redeploy the latest version if Cloudflare asks.

Never place the Brevo API key inside `script.js`, an HTML file, GitHub, or an email.

## 4. Test the whole order flow

Use your own email address as the customer.

1. Add one product to the cart.
2. Open the checkout, choose a payment preference, and send the request.
3. Confirm that `justbnaturalss@gmail.com` receives the complete order request.
4. Confirm that the customer receives a receipt saying **do not pay yet**.
5. In the business order email, choose **Confirm order & send payment steps**.
6. A ready-made email should open. Add the pickup or delivery location, date, and time, review the message, and send it.
7. Confirm that the customer receives that separate approval email.
8. Also test the **unavailable** button once.
9. Test the promotions form and confirm that the address appears in the Brevo contact list only when the consent checkbox was selected.

## 5. Buy a domain

Keeping the domain and hosting in the same Cloudflare account is the simplest arrangement.

1. In Cloudflare, go to **Domain Registration** or **Register Domains**.
2. Search for a short name. Good names to try include `justbnaturals.ca`, `shopjustbnaturals.ca`, or `justbnaturalsaylmer.ca`.
3. Choose an available name, enter the correct owner/contact information, pay for one year, and keep automatic renewal turned on.
4. Open and complete the domain-owner verification email. The domain can stop working if this step is skipped.

The domain is normally the only required yearly website cost. The exact price depends on the ending you choose, such as `.ca` or `.com`, and is shown before purchase.

## 6. Attach the domain to the website

1. In Cloudflare, return to **Workers & Pages** and open the Just B Naturals Pages project.
2. Open **Custom domains** and choose **Set up a domain**.
3. Enter the purchased domain and continue.
4. Because the domain and website are in the same Cloudflare account, Cloudflare should create the required DNS record and HTTPS certificate for you.
5. Add the `www` version too if you want both addresses to work. Pick one version as the main address and redirect the other to it.
6. Wait for the status to become active, then open the new address on a phone using cellular data and on a computer.

## Everyday order handling

1. A new request arrives in the business inbox with **Approval needed before payment** in the subject.
2. Check the products you actually have available.
3. If everything is available, choose the confirmation button, fill in pickup or delivery details, and send the approval email.
4. If something is unavailable, choose the unavailable button and send that message instead.
5. Accept the e-Transfer or cash only after the approval has been sent.
6. Keep the email thread as the order record.

This deliberately allows several people to request the same item but prevents them from being instructed to pay before stock is checked. If order volume becomes high, the next upgrade should be a small inventory/order database and a private dashboard—not customer accounts.
