# 🚫 Boys Entry Control System

## Overview
This feature allows admins to control when boys can register and join the platform, providing flexibility for managing registration rounds and controlling user flow.

## Features Added

### 1. Database Schema
- **New Table**: `system_settings` for storing application-wide configuration
- **Default Settings**:
  - `boys_registration_enabled`: Controls boys registration (boolean)
  - `boys_registration_message`: Custom message shown when registration is disabled
  - `girls_registration_enabled`: Controls girls registration (for future use)
  - `current_round_info`: Round management information

### 2. Admin Panel Controls
- **New Tab**: "System Controls" in admin panel
- **Boys Registration Toggle**: One-click enable/disable boys registration
- **Message Editor**: Customize the message shown to users when registration is disabled
- **Status Dashboard**: Visual status of boys/girls registration
- **Real-time Updates**: Changes take effect immediately

### 3. Frontend Integration
- **Landing Page**: 
  - Checks registration status on load
  - Disables "Join as Boy" button when registration is closed
  - Shows custom message explaining the closure
  - Prevents Google OAuth flow for boys when disabled
- **Post-Login Logic**: Prevents boys from completing onboarding when registration is disabled

### 4. API Endpoints
- **Admin API**: `/api/admin/system-settings`
  - `GET`: Fetch all system settings (admin only)
  - `PUT`: Update specific settings (admin only)
  - `POST`: Toggle boys registration or update message (admin only)
- **Public API**: `/api/registration-status`
  - `GET`: Check registration status (public, used by landing page)

## How It Works

### Admin Workflow
1. Admin goes to **System Controls** tab in admin panel
2. Clicks **"Stop Boys Registration"** button
3. Optionally edits the message shown to users
4. Boys registration is immediately disabled site-wide

### User Experience
- **Boys Registration Enabled**: Normal flow, boys can join freely
- **Boys Registration Disabled**:
  - "Join as Boy" button is greyed out and shows "Boys Registration Closed"
  - Orange alert box shows custom message (e.g., "Boys registration will open soon! Girls can join now.")
  - Clicking disabled button shows alert with custom message
  - Post-login flow blocked for boys with pending gender selection

### Girls Registration
- Girls can always register (unless specifically disabled)
- This system provides foundation for controlling girls registration too

## Database Schema

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_by TEXT, -- Admin email who made the change
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

## Usage Examples

### 1. Stop Boys Registration
```bash
# Via admin panel or API
POST /api/admin/system-settings
{
  "action": "toggle_boys_registration"
}
```

### 2. Update Message
```bash
# Via admin panel or API
POST /api/admin/system-settings
{
  "action": "update_message",
  "setting_value": "Round 1 is full! Boys registration for Round 2 opens on [date]."
}
```

### 3. Check Status (Public)
```bash
GET /api/registration-status
# Returns:
{
  "success": true,
  "boys_registration_enabled": false,
  "girls_registration_enabled": true,
  "boys_registration_message": "Boys registration will open soon! Girls can join now."
}
```

## Files Modified

### Database
- `add-boys-entry-control.sql` - Schema for system settings

### Backend APIs
- `app/api/admin/system-settings/route.ts` - Admin controls
- `app/api/registration-status/route.ts` - Public status check

### Frontend Components
- `app/components/AdminPanel.tsx` - Added System Controls tab
- `app/components/LandingPage.tsx` - Registration status checking and UI updates

## Security Features

- **Admin Only**: Only verified admins can change settings
- **RLS Policies**: Database-level security for system settings
- **Audit Trail**: Tracks which admin made changes and when
- **Fallback**: Defaults to "enabled" if settings fail to load

## Benefits

1. **Round Management**: Control when boys can join for different rounds
2. **Load Balancing**: Manage registration flow based on capacity
3. **Marketing Control**: Coordinate with marketing campaigns
4. **Emergency Stop**: Quickly disable registration if needed
5. **Custom Messaging**: Inform users about registration status
6. **Admin Flexibility**: Real-time control without code deployments

## Future Enhancements

- **Scheduled Toggles**: Automatically enable/disable at specific times
- **Registration Quotas**: Limit number of boys per round
- **Email Notifications**: Notify waiting boys when registration reopens
- **Advanced Messaging**: Different messages for different user types
- **Integration**: Connect with payment systems for premium early access
