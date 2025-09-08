-- Final fix for boys registration on Vercel
-- Run this in Supabase SQL Editor

-- First, check current values
SELECT 'Current values:' as status;
SELECT setting_key, setting_value, pg_typeof(setting_value) as data_type 
FROM system_settings 
WHERE setting_key IN ('boys_registration_enabled', 'boys_registration_message');

-- Ensure boys registration is disabled (boolean false, not string)
UPDATE system_settings 
SET setting_value = 'false'::jsonb
WHERE setting_key = 'boys_registration_enabled';

-- Verify the update
SELECT 'After update:' as status;
SELECT setting_key, setting_value, pg_typeof(setting_value) as data_type 
FROM system_settings 
WHERE setting_key = 'boys_registration_enabled';

-- Test the registration status API would return
SELECT 'What API should return:' as status;
SELECT 
  setting_key,
  setting_value,
  CASE 
    WHEN setting_value = 'false'::jsonb THEN false
    WHEN setting_value = 'true'::jsonb THEN true
    ELSE setting_value
  END as converted_value
FROM system_settings 
WHERE setting_key = 'boys_registration_enabled';
