/*
# Court-defined pricing and bulk slot generation support

1. Plain-English summary
- The price a player pays is now a property of the COURT, not of each match. The court owner defines two
  prices when registering the court: the normal price and the discounted app price.
- Existing matches keep the prices they were created with: the match price columns stay in place and are
  still filled on insert, but the app now copies them from the court instead of asking the organizer.

2. Modified tables
- `courts`: new nullable columns `price_normal` (numeric, per-person normal price) and `price_app`
  (numeric, per-person price paid through the app). Nullable so old courts without a price keep working;
  the UI treats "no price" as a court that does not charge.

3. Security
- No policy, grant or RLS changes: `courts` already has owner-scoped policies. Column-level UPDATE grants
  are widened to include the two new columns so owners can set their prices through the app.

4. Notes
- No data loss: nothing is dropped or renamed. Existing rows get NULL prices until their owner fills them.
*/

ALTER TABLE courts ADD COLUMN IF NOT EXISTS price_normal numeric(10, 2);
ALTER TABLE courts ADD COLUMN IF NOT EXISTS price_app numeric(10, 2);

GRANT SELECT, INSERT, UPDATE, DELETE ON courts TO authenticated;
GRANT INSERT (owner_id, name, city, address, photo_url, price_normal, price_app) ON courts TO authenticated;
GRANT UPDATE (name, city, address, photo_url, price_normal, price_app) ON courts TO authenticated;
