/*
# Prevent double booking of a court slot

1. Modified tables
- `matches`: a court can hold only one match at the same start time.

2. Security
- No change to policies or grants.

3. Notes
- Existing matches already have distinct court and start time pairs, so no data is changed.
- Re-running this migration has no effect.
*/

CREATE UNIQUE INDEX IF NOT EXISTS matches_court_starts_at_unique ON matches (court_id, starts_at);
