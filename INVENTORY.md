# Inventory

The private inventory page is:

`https://justbnatural.ca/inventory.html`

Enter the inventory passcode, type a whole-number stock count beside each
product, and press **Save changes**. Leave a box blank when the website should
not display a count. Enter `0` to show **Out of stock**.

The page writes directly to the existing Cloudflare D1 database
`just-b-naturals-inventory`. The passcode is stored as the Worker secret
`INVENTORY_ADMIN_KEY`; it is never stored in the website files or GitHub.

`inventory.sql` remains the repeatable schema/seed file. It uses
`INSERT OR IGNORE`, so running it again does not overwrite stock values.
`catalog.json` remains the database-ready product-data export.
