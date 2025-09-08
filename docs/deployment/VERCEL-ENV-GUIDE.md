# 🚀 VERCEL DEPLOYMENT - ENVIRONMENT VARIABLES

## 📋 **Required Environment Variables for Vercel**

Copy these environment variables to your Vercel project settings:

### **🔧 Vercel Dashboard → Project → Settings → Environment Variables**

Add each of these variables:

---

### **1. Supabase Configuration**

**NEXT_PUBLIC_SUPABASE_URL**
```
https://your-project-id.supabase.co
```
- **Description**: Your Supabase project URL
- **Where to find**: Supabase Dashboard → Settings → API → Project URL

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Description**: Supabase anonymous/public key
- **Where to find**: Supabase Dashboard → Settings → API → anon/public key

**SUPABASE_SERVICE_ROLE_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- **Description**: Supabase service role key (KEEP SECRET!)
- **Where to find**: Supabase Dashboard → Settings → API → service_role key
- **⚠️ WARNING**: This gives admin access - keep it secret!

---

### **2. Google OAuth Configuration**

**GOOGLE_CLIENT_ID**
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```
- **Description**: Google OAuth client ID
- **Where to find**: Google Cloud Console → APIs & Services → Credentials

**GOOGLE_CLIENT_SECRET**
```
GOCSPX-abcdefghijklmnop
```
- **Description**: Google OAuth client secret
- **Where to find**: Google Cloud Console → APIs & Services → Credentials

---

### **3. NextAuth Configuration**

**NEXTAUTH_SECRET**
```
your-32-character-random-string
```
- **Description**: Secret for JWT encryption
- **How to generate**: 
  ```bash
  openssl rand -base64 32
  ```
- **Or use**: https://generate-secret.vercel.app/32

**NEXTAUTH_URL**
```
https://your-app-name.vercel.app
```
- **Description**: Your production URL
- **For development**: `http://localhost:3000`
- **For production**: Your actual Vercel domain

---

## 🔧 **How to Add Variables in Vercel**

### **Method 1: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add each variable name and value
6. Set environment to **Production** (and Preview if needed)

### **Method 2: Vercel CLI**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

---

## 🎯 **COPY-PASTE READY ENVIRONMENT VARIABLES**

**Copy each line below and paste as separate environment variables in Vercel:**

```
NEXT_PUBLIC_SUPABASE_URL=https://xdhtrwaghahigmbojotu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Njk1OTYsImV4cCI6MjA3MTU0NTU5Nn0.ItDXVqjGSI-DaRCCbTCiWbopMnhXLGQiA3DMgBEzS4s
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkaHRyd2FnaGFoaWdtYm9qb3R1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk2OTU5NiwiZXhwIjoyMDcxNTQ1NTk2fQ.jPUCz6SW5QnJBkzsfn1uy8ps8I55GgTBLOVjCAkT7g4
GOOGLE_CLIENT_ID=1057140221361-al14sbgrlt6nlrp6g5ecdboshuc0f0tf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXTAUTH_SECRET=cufy-nextauth-secret-key-2025
NEXTAUTH_URL=https://cufy.in
```

**✅ Updated with your domain: cufy.in**

---

## ⚠️ **Important Notes**

### **Security**
- ✅ **Public variables** (`NEXT_PUBLIC_*`): Safe to expose to client
- 🔒 **Private variables**: Server-side only, never expose
- 🚨 **Service Role Key**: Most sensitive - admin database access

### **Google OAuth Setup**
Make sure to add your Vercel domain to Google OAuth:
1. Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client
3. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

### **Deployment**
- ✅ Add all variables **before** deploying
- 🔄 Redeploy after adding/changing variables
- 🧪 Test in Preview environment first

---

## 🚀 **Quick Deployment Checklist**

- [ ] Add all 7 environment variables to Vercel
- [ ] Update Google OAuth redirect URLs
- [ ] Deploy your database schema (MASTER-SCHEMA.sql)
- [ ] Test the deployment
- [ ] Verify admin panel access
- [ ] Check user registration flow

**Ready to deploy! 🎉**
