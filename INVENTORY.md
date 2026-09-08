# Inventory management

The live catalog is connected to the Cloudflare D1 database named
`just-b-naturals-inventory`. Every current product has one row in the
`inventory` table. Prices and stock counts intentionally start as `NULL` so
the website does not display invented values.

To update stock in the Cloudflare dashboard, open **Storage & Databases → D1 →
just-b-naturals-inventory → Console** and run, for example:

```sql
UPDATE inventory
SET stock_count = 12, updated_at = CURRENT_TIMESTAMP
WHERE product_id = 'matcha-lavender-soap';
```

Use `NULL` instead of a number when a count is not yet set. Use `is_active = 0`
to mark a product unavailable without deleting its catalog record. The site
reads this table through `/api/products` and shows a count only when one has
been entered.
