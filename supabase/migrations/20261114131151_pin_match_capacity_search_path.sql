/*
# Pin search path of match capacity check

1. Modified functions
- `enforce_match_capacity`: the function that blocks adding players beyond the match's total or goalkeeper spots now runs with a fixed search path (`public`).

2. Security
- Prevents the function from resolving table names through a search path that a caller could change.
- No change to the capacity rules or to any table data.

3. Notes
- Re-running this migration has no further effect.
*/

ALTER FUNCTION enforce_match_capacity() SET search_path = public;
