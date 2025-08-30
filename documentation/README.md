# Cufy Dating Platform v3.1

A modern, robust dating platform built with Next.js 13, Supabase, and NextAuth, featuring comprehensive user management, matching algorithms, and admin capabilities.

## 🚀 Features

### Core Features
- **Enhanced Onboarding**: Separate flows for boys and girls with comprehensive validation
- **Google Authentication**: Secure OAuth integration with NextAuth
- **Advanced Matching System**: Temporary and permanent matching zones with time-based logic
- **Admin Panel**: Complete management system for users, assignments, and matches
- **Real-time Dashboards**: Dynamic user interfaces for both regular users and admins

### User Management
- Profile creation and management
- Assignment-based matching (male users get 3 profiles, female users can be assigned to 2)
- Temporary matches with 48-hour expiration
- Permanent matches for continued connections
- Disengagement tracking and history

### Admin Features
- User assignment and management
- Force disengagement capabilities
- Match monitoring and analytics
- Profile assignment logic with limits
- Comprehensive audit trail

## 🛠 Tech Stack

- **Frontend**: Next.js 13 (App Router), React, TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS, Framer Motion
- **UI Components**: Custom components with Radix UI primitives
- **Icons**: Lucide React

## 📁 Project Structure

```
app/
├── components/           # React components
│   ├── AdminPanel.tsx   # Complete admin interface
│   ├── Dashboard.tsx    # User dashboard with matching logic
│   ├── BoysOnboarding.tsx
│   ├── GirlsOnboarding.tsx
│   ├── LandingPage.tsx
│   └── ui/              # Reusable UI components
├── api/                 # API routes
│   ├── auth/           # NextAuth configuration
│   ├── user/           # User-related endpoints
│   └── admin/          # Admin-only endpoints
├── admin/              # Admin page
├── dashboard/          # User dashboard page
├── boys-onboarding/    # Male user onboarding
├── girls-onboarding/   # Female user onboarding
└── gender-selection/   # Gender selection page
```

## 🗄 Database Schema

### Core Tables
- **users**: User profiles and basic information
- **profile_assignments**: Assignment logic between male and female users
- **temporary_matches**: 48-hour matching zone
- **permanent_matches**: Long-term connections
- **disengagement_history**: Tracking of all disengagements
- **admin_actions**: Audit trail for admin activities

### Key Features
- Row Level Security (RLS) on all tables
- Automatic triggers for assignment limits
- Functions for match promotion and disengagement
- Comprehensive indexing for performance

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google OAuth application

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd cufy_3.1v
   npm install
   ```

2. **Environment Setup**:
   Create `.env.local` with:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Database Setup**:
   ```bash
   # Run the schema file in your Supabase SQL editor
   psql -h your-db-host -U postgres -d postgres -f supabase_schema.sql
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

## 🔐 Authentication Flow

1. **Landing Page**: Users can sign in with Google or continue as guest
2. **Gender Selection**: New users choose their gender
3. **Onboarding**: Gender-specific forms with validation
4. **Dashboard**: Personalized interface based on user type and status

## 👥 User Roles & Permissions

### Regular Users
- **Male Users**: Receive up to 3 profile assignments, can reveal and interact
- **Female Users**: Can be assigned to up to 2 male users, passive assignment model
- **All Users**: Access to temporary/permanent zones, profile management

### Admin Users
- Full user management capabilities
- Assignment control and override
- Match monitoring and intervention
- Analytics and reporting
- Force disengagement powers

## 🎯 Matching Logic

### Assignment Phase
1. Male users receive up to 3 female profiles
2. Female users can be assigned to up to 2 male users
3. Profiles must be revealed to proceed to matching

### Temporary Zone (48 hours)
1. When both users reveal profiles, temporary match created
2. 48-hour window for interaction
3. Either user can disengage
4. Automatic expiration if no action taken

### Permanent Zone
1. Users who don't disengage get promoted to permanent matches
2. Long-term connection established
3. Enhanced communication features unlocked

## 🔧 API Endpoints

### User Endpoints
- `GET /api/user/profile` - Get user profile
- `GET /api/user/assignments` - Get user's profile assignments
- `GET /api/user/temporary-matches` - Get temporary matches
- `GET /api/user/permanent-matches` - Get permanent matches
- `POST /api/user/reveal-profile` - Reveal an assigned profile
- `POST /api/user/disengage` - Disengage from a temporary match

### Admin Endpoints
- `POST /api/admin/check` - Verify admin permissions
- `GET /api/admin/users` - Get all users
- `GET /api/admin/assignments` - Get all assignments
- `POST /api/admin/assign-profile` - Manually assign profile
- `POST /api/admin/force-disengage` - Force match disengagement

## 🎨 UI Components

### Custom Components
- **FloatingShapes**: Animated background elements
- **OnboardingStep**: Reusable onboarding step component
- **Card, Button, Input**: Custom styled components
- **Tabs, Dialog, Progress**: Enhanced UI elements

### Design System
- Gradient backgrounds and glass morphism effects
- Responsive design for all screen sizes
- Smooth animations with Framer Motion
- Consistent color scheme and typography

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **Session Management**: Secure authentication with NextAuth
- **Input Validation**: Comprehensive form validation
- **Rate Limiting**: API endpoint protection
- **Audit Trail**: Complete admin action logging

## 📊 Analytics & Monitoring

- User registration and onboarding metrics
- Match success rates and engagement
- Assignment distribution analytics
- Admin action tracking
- Performance monitoring

## 🚀 Deployment

### Vercel Deployment
```bash
npm run build
vercel deploy
```

### Environment Variables
Ensure all environment variables are set in your deployment platform.

### Database Migrations
Run the schema file against your production Supabase instance.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Version**: 3.1
**Last Updated**: January 2024
**Developed by**: Cufy Development Team
