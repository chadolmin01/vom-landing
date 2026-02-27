-- Create landing_subscribers table for email subscription
CREATE TABLE IF NOT EXISTS landing_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE landing_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous insert (for landing page visitors)
CREATE POLICY "Allow anonymous insert" ON landing_subscribers
  FOR INSERT WITH CHECK (true);

-- Allow read for authenticated users (for admin)
CREATE POLICY "Allow authenticated read" ON landing_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');
