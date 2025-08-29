-- Fix assignments that are incorrectly marked as revealed
-- This should be run once to fix existing data

UPDATE profile_assignments 
SET 
  status = 'assigned',
  male_revealed = false,
  female_revealed = false,
  revealed_at = NULL
WHERE male_revealed != true 
  AND status = 'revealed';

-- Ensure all new assignments have correct defaults
UPDATE profile_assignments 
SET 
  status = 'assigned',
  male_revealed = false,
  female_revealed = false
WHERE status IS NULL 
  OR male_revealed IS NULL 
  OR female_revealed IS NULL;

-- Verification: Check current state
SELECT 
  id,
  status,
  male_revealed,
  female_revealed,
  revealed_at,
  created_at
FROM profile_assignments 
ORDER BY created_at DESC 
LIMIT 10;
