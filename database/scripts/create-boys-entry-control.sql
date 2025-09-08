-- Create boys_entry_control table
CREATE TABLE IF NOT EXISTS boys_entry_control (
  id SERIAL PRIMARY KEY,
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Insert default record
INSERT INTO boys_entry_control (enabled) VALUES (true) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE boys_entry_control ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage boys entry control" ON boys_entry_control
  FOR ALL USING (auth.role() = 'service_role');
