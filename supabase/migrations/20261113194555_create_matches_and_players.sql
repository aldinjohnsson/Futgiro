/*
# Create matches and match players

1. New Tables
- `matches`: games organized at a court.
  - `id` (text, primary key; new rows get a generated id)
  - `court_id` (the court where the game happens; a court with matches cannot be deleted)
  - `modality`, `starts_at`, `total_spots`, `goalkeeper_spots`
  - `requires_payment` (whether players pay through the app)
  - `price_normal` and `price_app` (regular price and price when paying through the app)
  - `organizer_name`
  - `payment_released_at` (empty until the organizer releases payment)
- `match_players`: people registered in a match.
  - `player_name`, `is_goalkeeper`, `team_number` (empty until teams are drawn), `is_paid`

2. Business rules enforced by the database
- A match cannot receive more players than its total spots.
- A match cannot receive more goalkeepers than its goalkeeper spots.
- Paid matches must have both prices, and the app price cannot be higher than the regular price.

3. Seed data
- The three demonstration matches are inserted with stable ids and demonstration players so the home page keeps its content. Re-running this migration does not duplicate them.

4. Security
- Row level security is enabled on both tables.
- The app has no sign-in screen, so the anonymous and signed-in roles get full access, granted explicitly.
- Each table has one policy per action (read, create, update, delete).
- The capacity check function cannot be called directly by app users.

5. Notes
- No existing data is changed or removed.
- Ownership of matches is not enforced yet; it requires sign-in.
*/

CREATE TABLE IF NOT EXISTS matches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  court_id text NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  modality text NOT NULL CHECK (char_length(modality) BETWEEN 2 AND 60),
  starts_at timestamptz NOT NULL,
  total_spots integer NOT NULL CHECK (total_spots BETWEEN 2 AND 40),
  goalkeeper_spots integer NOT NULL DEFAULT 0 CHECK (goalkeeper_spots >= 0),
  requires_payment boolean NOT NULL DEFAULT false,
  price_normal numeric(10,2) CHECK (price_normal IS NULL OR price_normal >= 0),
  price_app numeric(10,2) CHECK (price_app IS NULL OR price_app >= 0),
  organizer_name text NOT NULL CHECK (char_length(organizer_name) BETWEEN 2 AND 80),
  payment_released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT matches_goalkeepers_within_spots CHECK (goalkeeper_spots <= total_spots),
  CONSTRAINT matches_prices_when_paid CHECK (
    NOT requires_payment
    OR (price_normal IS NOT NULL AND price_app IS NOT NULL AND price_app <= price_normal)
  )
);

CREATE INDEX IF NOT EXISTS matches_court_id_idx ON matches (court_id);

CREATE TABLE IF NOT EXISTS match_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_name text NOT NULL CHECK (char_length(player_name) BETWEEN 2 AND 80),
  is_goalkeeper boolean NOT NULL DEFAULT false,
  team_number smallint CHECK (team_number IS NULL OR team_number >= 1),
  is_paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS match_players_match_id_idx ON match_players (match_id);

CREATE OR REPLACE FUNCTION enforce_match_capacity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  match_row matches%ROWTYPE;
  players_count integer;
  goalkeepers_count integer;
BEGIN
  SELECT * INTO match_row FROM matches WHERE id = NEW.match_id;
  SELECT count(*), count(*) FILTER (WHERE is_goalkeeper)
    INTO players_count, goalkeepers_count
    FROM match_players
    WHERE match_id = NEW.match_id;

  IF players_count >= match_row.total_spots THEN
    RAISE EXCEPTION 'Não há vagas disponíveis nesta partida.';
  END IF;

  IF NEW.is_goalkeeper AND goalkeepers_count >= match_row.goalkeeper_spots THEN
    RAISE EXCEPTION 'Não há vagas de goleiro disponíveis nesta partida.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION enforce_match_capacity() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS match_players_capacity ON match_players;
CREATE TRIGGER match_players_capacity
  BEFORE INSERT ON match_players
  FOR EACH ROW EXECUTE FUNCTION enforce_match_capacity();

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON matches TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON match_players TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_matches" ON matches;
CREATE POLICY "anon_select_matches" ON matches FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_matches" ON matches;
CREATE POLICY "anon_insert_matches" ON matches FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_matches" ON matches;
CREATE POLICY "anon_update_matches" ON matches FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_matches" ON matches;
CREATE POLICY "anon_delete_matches" ON matches FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_match_players" ON match_players;
CREATE POLICY "anon_select_match_players" ON match_players FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_match_players" ON match_players;
CREATE POLICY "anon_insert_match_players" ON match_players FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_match_players" ON match_players;
CREATE POLICY "anon_update_match_players" ON match_players FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_match_players" ON match_players;
CREATE POLICY "anon_delete_match_players" ON match_players FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO matches (id, court_id, modality, starts_at, total_spots, goalkeeper_spots, requires_payment, price_normal, price_app, organizer_name, payment_released_at) VALUES
  ('match-society-terca', 'arena-do-vale', 'Futebol Society', '2026-11-17T20:00:00-03:00', 12, 1, true, 22, 20, 'Carlos Henrique', now()),
  ('match-futsal-quarta', 'quadra-central-sports', 'Futsal', '2026-11-18T19:30:00-03:00', 10, 1, true, 25, 22, 'Mariana Souza', NULL),
  ('match-society-feminino', 'society-atlantico', 'Society Feminino', '2026-11-21T09:00:00-03:00', 14, 0, true, 24, 21, 'Juliana Prado', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO match_players (match_id, player_name, is_goalkeeper)
SELECT v.match_id, v.player_name, v.is_goalkeeper
FROM (VALUES
  ('match-society-terca', 'Carlos Henrique', true),
  ('match-society-terca', 'Rafael Lima', false),
  ('match-society-terca', 'Bruna Costa', false),
  ('match-society-terca', 'Lucas Andrade', false),
  ('match-society-terca', 'Felipe Gomes', false),
  ('match-society-terca', 'Thiago Rocha', false),
  ('match-futsal-quarta', 'Mariana Souza', false),
  ('match-futsal-quarta', 'Pedro Alves', true),
  ('match-futsal-quarta', 'Gabriel Nunes', false),
  ('match-futsal-quarta', 'Renan Dias', false),
  ('match-futsal-quarta', 'Igor Matos', false),
  ('match-futsal-quarta', 'Vitor Hugo', false),
  ('match-futsal-quarta', 'Leandro Pires', false),
  ('match-society-feminino', 'Juliana Prado', false),
  ('match-society-feminino', 'Camila Nunes', false),
  ('match-society-feminino', 'Letícia Braga', false),
  ('match-society-feminino', 'Patrícia Lopes', false)
) AS v(match_id, player_name, is_goalkeeper)
WHERE NOT EXISTS (
  SELECT 1 FROM match_players mp WHERE mp.match_id = v.match_id AND mp.player_name = v.player_name
);
