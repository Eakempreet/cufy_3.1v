-- =================================================================
-- FIX BOYS ENTRY CONTROL FOR VERCEL/PRODUCTION
-- =================================================================
-- This fixes the RLS policy issue that prevents the admin toggle from working on Vercel

BEGIN;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Everyone can read system settings" ON system_settings;

-- Create fixed admin policy (no recursion with users table)
CREATE POLICY "Admins can manage system settings" ON system_settings
FOR ALL USING (
    auth.jwt() ->> 'email' = 'cufy.online@gmail.com'
);

-- Create public read policy
CREATE POLICY "Everyone can read system settings" ON system_settings
FOR SELECT USING (true);

-- Ensure the table exists and has the right data
INSERT INTO system_settings (setting_key, setting_value, description, updated_by) 
VALUES 
('boys_registration_enabled', 'true', 'Controls whether boys can register and join', 'system'),
('boys_registration_message', '"Boys registration will open soon! Girls can join now."', 'Message to show when boys registration is disabled', 'system'),
('girls_registration_enabled', 'true', 'Controls whether girls can register and join', 'system'),
('current_round_info', '{"round": 1, "status": "open", "description": "Round 1 - Open for all"}', 'Current round information', 'system')
ON CONFLICT (setting_key) DO NOTHING;

COMMIT;

-- Test the setup
SELECT 'Testing system_settings table:' as status;
SELECT 
    setting_key,
    setting_value,
    description,
    updated_by,
    created_at
FROM system_settings
ORDER BY setting_key;

-- Test admin access (run this as cufy.online@gmail.com)
SELECT 'Testing admin access:' as status;
UPDATE system_settings 
SET setting_value = 'false' 
WHERE setting_key = 'boys_registration_enabled';

SELECT 'Boys registration status after test:' as status;
SELECT setting_key, setting_value 
FROM system_settings 
WHERE setting_key = 'boys_registration_enabled';

-- Reset to true for safety
UPDATE system_settings 
SET setting_value = 'true' 
WHERE setting_key = 'boys_registration_enabled';
