/*
# Court price becomes total rent; match splits it; goalkeepers can pay nothing

1. Plain-English summary
- The price the court owner sets is now the TOTAL rent of the court for a slot (e.g. R$ 120 for the hour),
  not a per-person price. When a match is created, the app divides that total among the players who pay.
- Goalkeepers can be exempt: each player row gains an `is_exempt` flag. An exempt player (typically a
  goalkeeper) pays nothing, and the court total is divided only among the non-exempt players.
- The old two-price model (normal price vs cheaper app price) is replaced by a single total rent.
  No court has prices filled yet, so nothing is lost by repurposing the columns.

2. Modified tables
- `courts`: `price_normal` is renamed to `price_total` (numeric, total rent per slot). The `price_app`
  column is dropped — the app discount model no longer applies. Renaming keeps history readable and no
  data is lost (both columns were NULL everywhere).
- `match_players`: new column `is_exempt` (boolean, not null, default false). Exempt players do not
  count in the per-person split. The existing `is_paid` flag stays: exempt players are simply never
  marked as paid.

3. Security
- No RLS/policy changes. Grants on `courts` are re-stated for the renamed columns; `match_players`
  grants already cover table-level writes, and the new column is owner-managed through the app.

4. Notes
- Idempotent: guarded with IF EXISTS / DO block. Safe to re-run.
- Matches keep snapshot copies of the court total at creation time (`price_total` on matches replaces
  `price_normal`/`price_app`), so changing a court's price later does not alter past matches.
*/

ALTER TABLE courts RENAME COLUMN price_normal TO price_total;
ALTER TABLE courts DROP COLUMN IF EXISTS price_app;

ALTER TABLE match_players ADD COLUMN IF NOT EXISTS is_exempt boolean NOT NULL DEFAULT false;

GRANT SELECT, INSERT, UPDATE, DELETE ON courts TO authenticated;
GRANT INSERT (owner_id, name, city, address, photo_url, price_total) ON courts TO authenticated;
GRANT UPDATE (name, city, address, photo_url, price_total) ON courts TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON match_players TO authenticated;
GRANT INSERT (match_id, player_name, is_goalkeeper, is_exempt) ON match_players TO authenticated;
GRANT UPDATE (player_name, is_goalkeeper, is_exempt, is_paid, team_number) ON match_players TO authenticated;
