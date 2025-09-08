# Cufy Dating App

A Next.js-based dating application with Supabase backend, featuring secure payment processing, user authentication, and comprehensive admin tools.

## 🚀 Project Structure

```
cufy_3.1v-3/
├── app/                     # Next.js App Router pages and components
│   ├── api/                # API routes
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── payment/           # Payment flow pages
│   └── ...               # Other pages
├── src/                    # Source code and configurations
│   ├── components/        # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries and configs
│   ├── components.json   # shadcn/ui configuration
│   └── middleware.ts     # Next.js middleware
├── database/               # Database related files
│   ├── schemas/          # Database schema definitions
│   ├── migrations/       # Database migration scripts
│   ├── policies/         # Row Level Security policies
│   └── scripts/          # Database utility scripts
├── scripts/                # Utility scripts
│   ├── dev/              # Development scripts and docs
│   ├── db/               # Database management scripts
│   └── test/             # Testing scripts
└── docs/                   # Documentation
    ├── features/         # Feature documentation
    ├── deployment/      # Deployment guides
    └── troubleshooting/ # Troubleshooting guides
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage)
- **Authentication**: NextAuth.js with Supabase adapter
- **Payments**: Custom payment proof system
- **UI Components**: shadcn/ui
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd cufy_3.1v-3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Set up the database**
   ```bash
   # Run database setup scripts
   node scripts/db/setup-admin-notes.js
   node scripts/db/create-admin-notes-table.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 🔐 Environment Setup

### Required Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Additional configurations...
```

See `.env.local.template` for complete configuration.

## 📊 Database Schema

The application uses Supabase with the following key tables:
- `users` - User profiles and authentication
- `subscriptions` - User subscription management
- `payment_proofs` - Payment verification system
- `admin_notes` - Admin management system
- `boys_entry_control` - Entry control system

See `database/schemas/` for detailed schema definitions.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing

Run development tests:
```bash
node scripts/test/test-connection.js
node scripts/test/test-supabase-connection.js
node scripts/test/test-api-response.js
```

### Database Management

```bash
# Check database connection
node scripts/db/check-database.js

# Explore database structure
node scripts/db/explore-db.js

# Update schema
node scripts/db/update-schema.js
```

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**
   - Import project to Vercel
   - Configure environment variables

2. **Environment Variables**
   - Copy all variables from `.env.local`
   - Ensure production URLs are used

3. **Deploy**
   ```bash
   npm run build
   ```

See `docs/deployment/` for detailed deployment guides.

## 📝 Key Features

### 🔐 Authentication System
- NextAuth.js integration with Supabase
- Secure session management
- Role-based access control

### 💳 Payment System
- Custom payment proof upload
- Admin verification workflow
- Secure file storage with Supabase

### 👥 User Management
- Profile completion flow
- Subscription management
- Gender-based onboarding

### 🛡️ Admin Panel
- User management
- Payment verification
- System monitoring

### 🔒 Security Features
- Row Level Security (RLS) policies
- Secure file uploads
- Authentication middleware

## 🐛 Troubleshooting

### Common Issues

1. **Payment Upload Errors**
   - Check Supabase storage bucket configuration
   - Verify RLS policies
   - See `docs/troubleshooting/payment-upload-issues.md`

2. **Authentication Issues**
   - Verify environment variables
   - Check NextAuth configuration
   - See `docs/troubleshooting/auth-issues.md`

3. **Database Connection**
   - Test with `scripts/test/test-connection.js`
   - Check Supabase credentials

## 📚 Documentation

- [Setup Guide](docs/deployment/SETUP_GUIDE.md)
- [Payment Flow](docs/features/PAYMENT_FLOW_SUMMARY.md)
- [Admin Access](docs/troubleshooting/ADMIN-ACCESS-TROUBLESHOOTING.md)
- [Deployment Guide](docs/deployment/DEPLOYMENT-GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. All rights reserved.

## 🆘 Support

For technical support or questions, please refer to:
- Documentation in `docs/`
- Troubleshooting guides
- Test scripts in `scripts/test/`
