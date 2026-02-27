-- Drop existing policy if exists
DROP POLICY IF EXISTS "Allow anonymous insert" ON landing_subscribers;
DROP POLICY IF EXISTS "Allow authenticated read" ON landing_subscribers;

-- Create policy that allows anyone to insert (including anonymous/anon role)
CREATE POLICY "Enable insert for anon" ON landing_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role to read all
CREATE POLICY "Enable read for service role" ON landing_subscribers
  FOR SELECT
  TO service_role
  USING (true);
