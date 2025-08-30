# Reveal and Disengage System Implementation

## Overview
This update implements a reveal-based matching system where female users can only see male profiles when the male user clicks "reveal", and both users must disengage to return to normal status.

## Key Features

### 1. Reveal System
- **Only male users can reveal profiles** assigned to them
- **Female users can only see male profiles after revelation**
- **Users in temporary matches cannot reveal new profiles** (locked until disengagement)
- When a male user reveals a profile, it creates a temporary match with a 48-hour decision window

### 2. Disengage System
- **Both users must disengage** to completely end a temporary match
- **Partial disengagement** is tracked - one user disengaging waits for the other
- **Complete disengagement** removes the temporary match and resets the assignment status
- **Users are locked from new assignments** while in temporary matches

### 3. Admin Dashboard Updates
- Shows **temp locked status** for users in temporary matches
- **Assign Profile button is disabled** for users in temporary matches
- **Color-coded status indicators** for different user states:
  - Green: Available
  - Blue: Assigned
  - Orange: Temp Locked
  - Purple: Permanent Match

### 4. Database Schema Changes
Added columns to support the new functionality:

#### profile_assignments table:
- `male_revealed` (BOOLEAN): Whether male user revealed this profile
- `female_revealed` (BOOLEAN): Whether female user has seen it
- `status` (VARCHAR): 'assigned', 'revealed', 'completed'
- `revealed_at` (TIMESTAMP): When profile was first revealed

#### temporary_matches table:
- `male_disengaged` (BOOLEAN): Whether male user disengaged
- `female_disengaged` (BOOLEAN): Whether female user disengaged

#### user_actions table (optional):
- Logs user actions for audit and analytics

## User Flow

### Male User Flow:
1. **Assignment**: Admin assigns up to 3 female profiles
2. **Reveal**: Male user clicks "Reveal Match" on assigned profiles
3. **Temporary Match**: Creates 48-hour decision window
4. **Decision**: Male user can like or disengage
5. **Locked State**: Cannot reveal new profiles while in temporary match
6. **Disengage**: Must disengage (and wait for female) to return to normal

### Female User Flow:
1. **Hidden**: Cannot see male profiles until revealed
2. **Notification**: Receives notification when profile is revealed
3. **Temporary Match**: 48-hour window to make decision
4. **Decision**: Can like or disengage
5. **Locked State**: Cannot receive new assignments while in temporary match
6. **Disengage**: Must disengage (and wait for male) to return to normal

### Admin Flow:
1. **Assignment**: Can assign profiles to users not in temporary matches
2. **Monitoring**: Can see user status and temporary match states
3. **Force Disengage**: Can force disengage if needed
4. **Lock Prevention**: Cannot assign to users in temporary matches

## API Endpoints

### `/api/user/reveal-profile` (POST)
- Reveals a female profile to create temporary match
- Only works for male users
- Prevents revelation if user is already in temporary match
- Creates 48-hour temporary match

### `/api/user/disengage` (POST)
- Disengages from temporary match
- Tracks partial vs complete disengagement
- Resets assignment status on complete disengagement
- Returns user to normal status when both disengage

### `/api/admin/assign-profile` (POST)
- Updated to prevent assignment to users in temporary matches
- Checks both male and female users for temporary match status

### `/api/admin/available-profiles` (POST)
- Updated to exclude users in temporary matches from assignment pool

## Installation Steps

1. **Run Migration**: Execute `reveal-disengage-migration.sql` in Supabase SQL editor
2. **Update Code**: All code files have been updated
3. **Test**: Verify functionality in admin dashboard and user dashboard

## Benefits

- **Clear User State**: Users know exactly where they stand
- **Fair Process**: Both users must agree to disengage
- **Prevents Conflicts**: No overlapping assignments/matches
- **Better UX**: Clear status indicators and locked states
- **Admin Control**: Full visibility and control over match states

## Migration Required

⚠️ **Important**: Run the migration script `reveal-disengage-migration.sql` in your Supabase SQL editor before testing the new functionality.
