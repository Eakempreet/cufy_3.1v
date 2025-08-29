# URGENT: Database Schema Fix Required

## Problem
The `profile_assignments` table schema is out of sync with the application code, causing errors when creating assignments in the admin panel.

## Current Schema Issues
- Missing `assigned_at`, `revealed_at`, `disengaged_at` columns
- Missing `male_revealed`, `female_revealed` columns  
- Status values don't match (`active`/`expired`/`matched` vs `assigned`/`revealed`/`disengaged`)

## Solution
Run the SQL migration script to fix the schema alignment.

## Steps to Fix

### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to the SQL Editor

### 2. Run the Migration Script
- Copy the contents of `CRITICAL-schema-fix.sql`
- Paste into the Supabase SQL Editor
- Click "Run" to execute the migration

### 3. Verify the Fix
After running the migration, you should see:
- New columns added to `profile_assignments` table
- Existing data migrated to new structure
- Status values updated to match application expectations

### 4. Test Admin Panel
- Go to `/admin` in your application
- Try assigning a profile to test if the error is resolved

## What the Migration Does

1. **Adds missing columns:**
   - `assigned_at` (timestamp when assignment was created)
   - `revealed_at` (timestamp when profile was revealed)
   - `disengaged_at` (timestamp when user disengaged)
   - `male_revealed` (boolean flag for reveal status)
   - `female_revealed` (boolean flag for reveal status)

2. **Migrates existing data:**
   - Sets `assigned_at` to `created_at` for existing records
   - Converts old column values to new structure
   - Updates status values to match API expectations

3. **Adds performance indexes:**
   - Improves query performance for common operations

4. **Updates constraints:**
   - Allows both old and new status values during transition

## Backup Recommendation
Before running the migration, consider backing up your `profile_assignments` table:

```sql
-- Create backup
CREATE TABLE profile_assignments_backup AS 
SELECT * FROM profile_assignments;
```

## Alternative: Manual Column Addition
If you prefer to add columns manually:

```sql
ALTER TABLE profile_assignments 
ADD COLUMN assigned_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN revealed_at TIMESTAMPTZ,
ADD COLUMN disengaged_at TIMESTAMPTZ,
ADD COLUMN male_revealed BOOLEAN DEFAULT FALSE,
ADD COLUMN female_revealed BOOLEAN DEFAULT FALSE;
```

## After Migration
The application will work with both old and new schema structures, providing a smooth transition.
