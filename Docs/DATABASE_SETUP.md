# Database & Authentication Setup Guide

## Overview

This guide covers setting up Supabase as your database and authentication provider for the Quran Memorization Platform.

## Why Supabase?

✅ **Free Tier**: 500MB database storage, unlimited API requests  
✅ **Built-in Auth**: Email/password + OAuth (Google, GitHub, etc.)  
✅ **Real-time**: WebSocket support for live updates  
✅ **PostgreSQL**: Powerful relational database  
✅ **Row-Level Security**: Built-in access control  

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free tier available)
3. Create a new project
4. Note your credentials:
   - **Project URL**: `https://YOUR-PROJECT-ID.supabase.co`
   - **Anon Key**: API key for client-side operations
   - **Service Role Key**: API key for server-side operations (keep secret!)

## Step 2: Set Up Database Schema

In your Supabase dashboard, go to **SQL Editor** and run this SQL:

```sql
-- Users table (links to Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Memorization plans table
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_data JSONB NOT NULL, -- Stores the complete MemorizationPlan object
  surah_number INTEGER NOT NULL CHECK (surah_number >= 1 AND surah_number <= 114),
  start_verse INTEGER NOT NULL CHECK (start_verse >= 1),
  end_verse INTEGER NOT NULL CHECK (end_verse >= start_verse),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Progress logs table
CREATE TABLE public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day > 0),
  date DATE NOT NULL,
  sabaq_completed BOOLEAN DEFAULT FALSE,
  sabaq_verses INTEGER,
  sabaq_retention_score NUMERIC(5,2) NOT NULL CHECK (sabaq_retention_score >= 0 AND sabaq_retention_score <= 100),
  manzil_retention_scores JSONB DEFAULT '{}', -- Map of verse ranges to scores
  session_duration INTEGER NOT NULL CHECK (session_duration >= 0), -- minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_status ON public.plans(status);
CREATE INDEX idx_progress_plan_id ON public.progress_logs(plan_id);
CREATE INDEX idx_progress_user_id ON public.progress_logs(user_id);
CREATE INDEX idx_progress_date ON public.progress_logs(date);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for plans table
CREATE POLICY "Users can view own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON public.plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON public.plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_logs table
CREATE POLICY "Users can view own progress"
  ON public.progress_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.progress_logs FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env
```

2. Add your Supabase credentials:

```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
PORT=3000
NODE_ENV=development
```

⚠️ **IMPORTANT**: Never commit `.env` to git! Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

## Step 4: Set Up Google OAuth (Optional)

For Google OAuth support in Supabase:

1. Go to your Supabase project → **Authentication** → **Providers**
2. Enable **Google**
3. Follow the instructions to create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
4. Add your credentials to Supabase

## Step 5: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `@supabase/supabase-js` - Supabase client
- `zod` - Input validation
- `dotenv` - Environment variable management

## Step 6: Test the Setup

1. Start the development server:

```bash
npm run dev
```

2. Test the health check:

```bash
curl http://localhost:3000/health
```

3. Test Surahs endpoint:

```bash
curl http://localhost:3000/api/surahs
```

## Database Schema Overview

### users table
- `id`: Unique user identifier (linked to Supabase auth)
- `email`: User email
- `full_name`: User's full name
- `language`: Preferred language (en/ar)
- `created_at`, `updated_at`: Timestamps

### plans table
- `id`: Unique plan identifier
- `user_id`: Reference to user
- `plan_name`: Name of the memorization plan
- `plan_data`: Complete MemorizationPlan JSON object
- `surah_number`: Surah being memorized
- `start_verse`, `end_verse`: Verse range
- `duration_days`: Total days for plan
- `status`: active/completed/paused/abandoned

### progress_logs table
- `id`: Unique progress log ID
- `plan_id`: Reference to plan
- `user_id`: Reference to user
- `day`: Day number in plan
- `sabaq_completed`: Whether new lesson was completed
- `sabaq_retention_score`: 0-100 score
- `manzil_retention_scores`: JSON map of revision scores
- `session_duration`: Minutes spent
- `notes`: Optional notes

## API Endpoints

### Authentication

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/profile
PUT /api/auth/profile
```

### Plans

```
POST /api/plans - Create and save plan
GET /api/plans - Get all user plans
GET /api/plans/:planId - Get specific plan
PUT /api/plans/:planId - Update plan
DELETE /api/plans/:planId - Delete plan
```

### Progress

```
POST /api/progress/log - Log daily progress
GET /api/progress/:planId - Get plan progress
GET /api/progress/:planId/stats - Get statistics
DELETE /api/progress/:progressId - Delete log
```

## Security Considerations

✅ **Row-Level Security**: All database access is restricted by user ID  
✅ **JWT Verification**: All protected endpoints require valid tokens  
✅ **Service Role Key**: Keep secret - only use on server  
✅ **Input Validation**: All requests validated with Zod schemas  
✅ **HTTPS Only**: Always use HTTPS in production  

## Troubleshooting

### "Missing Supabase environment variables"
- Check your `.env` file has all three variables
- Restart your development server

### "Invalid or expired token"
- Ensure you're sending the JWT in the Authorization header: `Bearer YOUR_TOKEN`
- Get a fresh token by logging in again

### RLS Policy errors
- Check that Row Level Security policies are created correctly
- Verify user_id matches auth.uid()

### Database connection errors
- Check SUPABASE_URL and keys are correct
- Ensure your IP is whitelisted (usually automatic)

## Next Steps

1. ✅ Database schema setup
2. ✅ Environment configuration
3. ✅ Backend API implementation
4. → Frontend authentication UI
5. → Plan management frontend
6. → Progress tracking dashboard

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint examples.
