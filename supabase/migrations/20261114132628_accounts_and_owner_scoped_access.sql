/*
# Accounts, player and court owner profiles, owner-scoped access

1. New Tables
- `profiles`: one row per signed-in account.
  - `id` (the account id from sign-in, primary key)
  - `full_name`
  - `is_player` and `is_court_owner`: an account can be either or both, but never neither.

2. Modified Tables
- `courts.owner_id`: the account that registered the court. New courts take the signed-in account automatically. Courts created before this change have no owner and can no longer be edited.
- `matches.owner_id`: the account that created the match. Same rule as courts.

3. Security
- Anyone (signed in or not) can still read courts, court hours, matches and players.
- Only signed-in accounts can create, change or delete data.
- Courts: only the owner can change or delete them. Court hours follow their court's owner.
- Matches: the match creator or the court owner can change or delete a match. The owner of a match cannot be reassigned, and the court and start time cannot be changed after creation.
- Match players: managed by the match creator or the court owner.
- Profiles: each account can read, create and update only its own profile.
- Old policies that allowed anonymous writes are removed.

4. Notes
- Demonstration courts and matches have no owner, so they stay visible but cannot be edited or removed. Create courts and matches with an account to manage them.
- Re-running this migration has no further effect.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 80),
  is_player boolean NOT NULL DEFAULT true,
  is_court_owner boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_has_role CHECK (is_player OR is_court_owner)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

DROP POLICY IF EXISTS "own_select_profile" ON profiles;
CREATE POLICY "own_select_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "own_insert_profile" ON profiles;
CREATE POLICY "own_insert_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "own_update_profile" ON profiles;
CREATE POLICY "own_update_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

ALTER TABLE courts ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE courts ALTER COLUMN owner_id SET DEFAULT auth.uid();

ALTER TABLE matches ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE matches ALTER COLUMN owner_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "anon_select_courts" ON courts;
DROP POLICY IF EXISTS "anon_insert_courts" ON courts;
DROP POLICY IF EXISTS "anon_update_courts" ON courts;
DROP POLICY IF EXISTS "anon_delete_courts" ON courts;
REVOKE INSERT, UPDATE, DELETE ON courts FROM anon, authenticated;
GRANT INSERT, DELETE ON courts TO authenticated;
GRANT UPDATE (name, city, address, photo_url) ON courts TO authenticated;

DROP POLICY IF EXISTS "public_select_courts" ON courts;
CREATE POLICY "public_select_courts" ON courts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_courts" ON courts;
CREATE POLICY "owner_insert_courts" ON courts FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owner_update_courts" ON courts;
CREATE POLICY "owner_update_courts" ON courts FOR UPDATE
  TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "owner_delete_courts" ON courts;
CREATE POLICY "owner_delete_courts" ON courts FOR DELETE
  TO authenticated USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "anon_select_court_slots" ON court_slots;
DROP POLICY IF EXISTS "anon_insert_court_slots" ON court_slots;
DROP POLICY IF EXISTS "anon_update_court_slots" ON court_slots;
DROP POLICY IF EXISTS "anon_delete_court_slots" ON court_slots;
REVOKE INSERT, UPDATE, DELETE ON court_slots FROM anon;

DROP POLICY IF EXISTS "public_select_court_slots" ON court_slots;
CREATE POLICY "public_select_court_slots" ON court_slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_court_slots" ON court_slots;
CREATE POLICY "owner_insert_court_slots" ON court_slots FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM courts WHERE courts.id = court_slots.court_id AND courts.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_court_slots" ON court_slots;
CREATE POLICY "owner_update_court_slots" ON court_slots FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courts WHERE courts.id = court_slots.court_id AND courts.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM courts WHERE courts.id = court_slots.court_id AND courts.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_court_slots" ON court_slots;
CREATE POLICY "owner_delete_court_slots" ON court_slots FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM courts WHERE courts.id = court_slots.court_id AND courts.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_select_matches" ON matches;
DROP POLICY IF EXISTS "anon_insert_matches" ON matches;
DROP POLICY IF EXISTS "anon_update_matches" ON matches;
DROP POLICY IF EXISTS "anon_delete_matches" ON matches;
REVOKE INSERT, UPDATE, DELETE ON matches FROM anon, authenticated;
GRANT INSERT, DELETE ON matches TO authenticated;
GRANT UPDATE (modality, total_spots, goalkeeper_spots, requires_payment, price_normal, price_app, organizer_name, payment_released_at) ON matches TO authenticated;

DROP POLICY IF EXISTS "public_select_matches" ON matches;
CREATE POLICY "public_select_matches" ON matches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_insert_matches" ON matches;
CREATE POLICY "owner_insert_matches" ON matches FOR INSERT
  TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "manager_update_matches" ON matches;
CREATE POLICY "manager_update_matches" ON matches FOR UPDATE
  TO authenticated USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
  ) WITH CHECK (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "manager_delete_matches" ON matches;
CREATE POLICY "manager_delete_matches" ON matches FOR DELETE
  TO authenticated USING (
    owner_id = auth.uid()
    OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "anon_select_match_players" ON match_players;
DROP POLICY IF EXISTS "anon_insert_match_players" ON match_players;
DROP POLICY IF EXISTS "anon_update_match_players" ON match_players;
DROP POLICY IF EXISTS "anon_delete_match_players" ON match_players;
REVOKE INSERT, UPDATE, DELETE ON match_players FROM anon;

DROP POLICY IF EXISTS "public_select_match_players" ON match_players;
CREATE POLICY "public_select_match_players" ON match_players FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "manager_insert_match_players" ON match_players;
CREATE POLICY "manager_insert_match_players" ON match_players FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_players.match_id
        AND (
          matches.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "manager_update_match_players" ON match_players;
CREATE POLICY "manager_update_match_players" ON match_players FOR UPDATE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_players.match_id
        AND (
          matches.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
        )
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_players.match_id
        AND (
          matches.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "manager_delete_match_players" ON match_players;
CREATE POLICY "manager_delete_match_players" ON match_players FOR DELETE
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = match_players.match_id
        AND (
          matches.owner_id = auth.uid()
          OR EXISTS (SELECT 1 FROM courts WHERE courts.id = matches.court_id AND courts.owner_id = auth.uid())
        )
    )
  );
