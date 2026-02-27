-- Drop all existing policies
DROP POLICY IF EXISTS "Enable insert for anon" ON landing_subscribers;
DROP POLICY IF EXISTS "Enable read for service role" ON landing_subscribers;

-- Create permissive policy for public insert (no role restriction)
CREATE POLICY "Allow public insert" ON landing_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to select (for duplicate check)
CREATE POLICY "Allow public select" ON landing_subscribers
  FOR SELECT
  TO public
  USING (true);
