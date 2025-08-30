-- =================================================================
-- BOYS ENTRY CONTROL SYSTEM
-- =================================================================
-- Add system settings to control boys registration

BEGIN;

-- Create system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by TEXT, -- Admin email who made the change
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) 
VALUES 
('boys_registration_enabled', 'true', 'Controls whether boys can register and join', 'system'),
('boys_registration_message', '"Boys registration will open soon! Girls can join now."', 'Message to show when boys registration is disabled', 'system'),
('girls_registration_enabled', 'true', 'Controls whether girls can register and join', 'system'),
('current_round_info', '{"round": 1, "status": "open", "description": "Round 1 - Open for all"}', 'Current round information', 'system')
ON CONFLICT (setting_key) DO NOTHING;

-- Add RLS policy for system settings (admin only)
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Admin can do everything with system settings
CREATE POLICY "Admins can manage system settings" ON system_settings
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.email = auth.jwt() ->> 'email' 
        AND users.is_admin = true
    )
);

-- Everyone can read system settings (for checking registration status)
CREATE POLICY "Everyone can read system settings" ON system_settings
FOR SELECT USING (true);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_system_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_system_settings_updated_at();

COMMIT;

-- Verify the setup
SELECT 
    setting_key,
    setting_value,
    description,
    updated_by,
    created_at
FROM system_settings
ORDER BY setting_key;
