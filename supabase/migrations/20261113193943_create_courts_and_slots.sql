/*
# Create courts and weekly available slots

1. New Tables
- `courts`: sports venues registered in FUTGIRO.
  - `id` (text, primary key; new rows get a generated id)
  - `name` (text, required, 2 to 80 characters)
  - `city` (text, required)
  - `address` (text, required)
  - `photo_url` (text, optional image address)
  - `rating` (numeric 0 to 5, optional; empty until reviews exist)
  - `review_count` (integer, defaults to 0)
  - `created_at` (timestamp)
- `court_slots`: weekly hours when a court is available.
  - `id` (uuid, primary key)
  - `court_id` (references courts; removed automatically when the court is removed)
  - `weekday` (0 = Sunday to 6 = Saturday)
  - `start_time` (time of the slot, for example 18:00)
  - `created_at` (timestamp)
  - Each court can have a given weekday and start time only once.

2. Seed data
- The five demonstration courts are inserted with stable ids so existing demonstration matches keep working. Re-running this migration does not duplicate them.

3. Security
- Row level security is enabled on both tables.
- The app has no sign-in screen, so the anonymous and signed-in roles both get full access, granted explicitly.
- Each table has one policy per action (read, create, update, delete).

4. Notes
- No existing data is changed or removed.
- Access is open to anyone with the app's public key. Restricting edits to the court owner requires sign-in, which is not part of this change.
*/

CREATE TABLE IF NOT EXISTS courts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  city text NOT NULL CHECK (char_length(city) BETWEEN 2 AND 80),
  address text NOT NULL CHECK (char_length(address) BETWEEN 3 AND 160),
  photo_url text,
  rating numeric(2,1) CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5)),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS court_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id text NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT court_slots_unique_time UNIQUE (court_id, weekday, start_time)
);

ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_slots ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON courts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON court_slots TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_courts" ON courts;
CREATE POLICY "anon_select_courts" ON courts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_courts" ON courts;
CREATE POLICY "anon_insert_courts" ON courts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_courts" ON courts;
CREATE POLICY "anon_update_courts" ON courts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_courts" ON courts;
CREATE POLICY "anon_delete_courts" ON courts FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_court_slots" ON court_slots;
CREATE POLICY "anon_select_court_slots" ON court_slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_court_slots" ON court_slots;
CREATE POLICY "anon_insert_court_slots" ON court_slots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_court_slots" ON court_slots;
CREATE POLICY "anon_update_court_slots" ON court_slots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_court_slots" ON court_slots;
CREATE POLICY "anon_delete_court_slots" ON court_slots FOR DELETE
  TO anon, authenticated USING (true);

INSERT INTO courts (id, name, city, address, photo_url, rating, review_count) VALUES
  ('arena-do-vale', 'Arena do Vale', 'Rio Branco do Sul', 'Rua das Acácias, 120 - Centro', 'https://images.pexels.com/photos/1249579/pexels-photo-1249579.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.8, 214),
  ('quadra-central-sports', 'Quadra Central Sports', 'Rio Branco do Sul', 'Av. Brasil, 845 - Jardim Esperança', 'https://images.pexels.com/photos/917503/pexels-photo-917503.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.6, 138),
  ('society-atlantico', 'Society Atlântico', 'Almirante Tamandaré', 'Rua Pinheiro Machado, 500 - Vila Verde', 'https://images.pexels.com/photos/3507477/pexels-photo-3507477.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.5, 92),
  ('ginasio-vila-verde', 'Ginásio Vila Verde', 'Almirante Tamandaré', 'Rua Coronel Macedo, 33 - Centro', 'https://images.pexels.com/photos/38876939/pexels-photo-38876939.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 0),
  ('campo-cruzeiro', 'Campo do Cruzeiro', 'Rio Branco do Sul', 'Estrada do Cruzeiro, s/n - Bairro Cruzeiro', 'https://images.pexels.com/photos/15521639/pexels-photo-15521639.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 4.3, 57)
ON CONFLICT (id) DO NOTHING;
