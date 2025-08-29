-- Quick fix for missing columns - run this if the reveal functionality is not working

-- If profile_assignments table doesn't have the required columns, add them:
DO $$ 
BEGIN
    -- Check and add male_revealed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profile_assignments' AND column_name='male_revealed') THEN
        ALTER TABLE profile_assignments ADD COLUMN male_revealed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check and add female_revealed column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profile_assignments' AND column_name='female_revealed') THEN
        ALTER TABLE profile_assignments ADD COLUMN female_revealed BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check and add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profile_assignments' AND column_name='status') THEN
        ALTER TABLE profile_assignments ADD COLUMN status VARCHAR(20) DEFAULT 'assigned';
    END IF;
    
    -- Check and add revealed_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profile_assignments' AND column_name='revealed_at') THEN
        ALTER TABLE profile_assignments ADD COLUMN revealed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Check and add male_disengaged column to temporary_matches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='temporary_matches' AND column_name='male_disengaged') THEN
        ALTER TABLE temporary_matches ADD COLUMN male_disengaged BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check and add female_disengaged column to temporary_matches
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='temporary_matches' AND column_name='female_disengaged') THEN
        ALTER TABLE temporary_matches ADD COLUMN female_disengaged BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Update existing records to have proper default values
UPDATE profile_assignments 
SET status = 'assigned' 
WHERE status IS NULL;

UPDATE profile_assignments 
SET male_revealed = FALSE 
WHERE male_revealed IS NULL;

UPDATE profile_assignments 
SET female_revealed = FALSE 
WHERE female_revealed IS NULL;

UPDATE temporary_matches 
SET male_disengaged = FALSE 
WHERE male_disengaged IS NULL;

UPDATE temporary_matches 
SET female_disengaged = FALSE 
WHERE female_disengaged IS NULL;

-- Verification query
SELECT 'Migration completed successfully' as status;


}
 ⚠ ./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
./node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js
./node_modules/@supabase/realtime-js/dist/main/index.js
./node_modules/@supabase/supabase-js/dist/main/index.js
./lib/supabase.ts
./app/components/ImageUpload.tsx
./app/components/BoysOnboarding.tsx
./app/boys-onboarding/page.tsx
 ✓ Compiled /api/auth/[...nextauth]/route in 1657ms (1552 modules)
 ✓ Compiled /api/admin/check/route in 1794ms (1548 modules)
<w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory, rename '/home/aman/Desktop/cufy_3.1v-1/.next/cache/webpack/client-development/4.pack.gz_' -> '/home/aman/Desktop/cufy_3.1v-1/.next/cache/webpack/client-development/4.pack.gz'
<w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory, rename '/home/aman/Desktop/cufy_3.1v-1/.next/cache/webpack/client-development/4.pack.gz_' -> '/home/aman/Desktop/cufy_3.1v-1/.next/cache/webpack/client-development/4.pack.gz'

