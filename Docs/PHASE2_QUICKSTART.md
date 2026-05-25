# Phase 2 Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies (1 min)
```bash
npm install
```

### Step 2: Create Supabase Account (2 min)
1. Go to https://supabase.com/sign-up
2. Sign up with email
3. Create a new project (select Free tier)
4. Wait for project to be ready

### Step 3: Copy Credentials (30 sec)
In Supabase Dashboard:
1. Settings → API
2. Copy these three values:
   - Project URL (under "API")
   - public anon key (under "API")
   - service_role key (under "API")

### Step 4: Create .env File (30 sec)
```bash
cp .env.example .env
```

Edit `.env` and paste your credentials:
```env
SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
SUPABASE_ANON_KEY=eyJ0...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ0...your-service-role-key...
PORT=3000
NODE_ENV=development
```

### Step 5: Run Database Schema (1 min)

In Supabase Dashboard:
1. Go to **SQL Editor**
2. Click **New Query**
3. Copy entire SQL from [DATABASE_SETUP.md](./DATABASE_SETUP.md) (the big SQL block)
4. Paste it
5. Click **Run**

Done! ✅

---

## Test It Out

### Terminal 1: Start Server
```bash
npm run dev
```

Should see:
```
🚀 Quran Memorization Server running on http://localhost:3000
📋 API available at http://localhost:3000/api
🏥 Health check at http://localhost:3000/health
```

### Terminal 2: Run Tests

**Health Check**
```bash
curl http://localhost:3000/health
```

**Get Surahs** (no auth needed)
```bash
curl http://localhost:3000/api/surahs | head -50
```

**Sign Up**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "fullName": "Test User"
  }'
```

Should return user ID.

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!"
  }'
```

Copy the `accessToken` from response.

**Create Plan** (paste your token below)
```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "surahNumber": 18,
    "startVerse": 1,
    "endVerse": 110,
    "durationDays": 30,
    "planName": "Al-Kahf 30 Days"
  }'
```

Copy the plan ID from response.

**Get Plans**
```bash
curl http://localhost:3000/api/plans \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Log Progress** (paste plan ID below)
```bash
curl -X POST http://localhost:3000/api/progress/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "planId": "PLAN_ID_HERE",
    "day": 1,
    "sabaqCompleted": true,
    "sabaqRetentionScore": 85,
    "sessionDuration": 20,
    "notesOrChallenges": "Good progress"
  }'
```

**Get Stats** (paste plan ID below)
```bash
curl http://localhost:3000/api/progress/PLAN_ID_HERE/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Issues

### "Missing Supabase environment variables"
- Check `.env` file exists
- Restart server: `npm run dev`
- Make sure you copied all 3 credentials

### "Invalid email" in signup
- Use proper email format: `user@example.com`
- Different email each time (or verify in Supabase first)

### "Invalid password" in signup
- Password must be 8+ characters
- Try: `Password123!`

### "Authentication failed" in API calls
- Make sure you copied `accessToken` (not `refreshToken`)
- Include `Authorization: Bearer ` prefix
- Token might be expired - login again

### SQL errors when running schema
- Copy the ENTIRE SQL block from DATABASE_SETUP.md
- Make sure you're in "SQL Editor" in Supabase
- Check for any syntax highlighting errors
- Run line by line if you get stuck

---

## What's Available Now

✅ User Authentication
- Signup with email/password
- Login and get token
- View/update profile
- Logout

✅ Plan Management
- Generate spaced repetition plans
- Save to database
- List your plans
- Update plan status
- Delete plans

✅ Progress Tracking
- Log daily progress
- Track retention scores
- Track session duration
- Add notes

✅ Statistics
- Average retention score
- Days completed
- Current streak
- Total session minutes

---

## Next: Frontend UI

After this works, build the React components:
- Auth forms (login/signup)
- Plan creator
- Progress tracker
- Dashboard with stats

See [PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md) for complete overview.

---

## Helpful Resources

| Resource | Link |
|----------|------|
| Supabase Docs | https://supabase.com/docs |
| API Full Reference | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| Database Schema Details | [DATABASE_SETUP.md](./DATABASE_SETUP.md) |
| Full Implementation | [PHASE2_IMPLEMENTATION.md](./PHASE2_IMPLEMENTATION.md) |

---

## Quick Reference: All Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/signup | ❌ | Register user |
| POST | /api/auth/login | ❌ | Login user |
| POST | /api/auth/logout | ✅ | Logout user |
| GET | /api/auth/profile | ✅ | Get profile |
| PUT | /api/auth/profile | ✅ | Update profile |
| GET | /api/surahs | ❌ | List Surahs |
| POST | /api/plans | ✅ | Create plan |
| GET | /api/plans | ✅ | List plans |
| GET | /api/plans/:id | ✅ | Get plan |
| PUT | /api/plans/:id | ✅ | Update plan |
| DELETE | /api/plans/:id | ✅ | Delete plan |
| POST | /api/progress/log | ✅ | Log progress |
| GET | /api/progress/:planId | ✅ | Get progress |
| GET | /api/progress/:planId/stats | ✅ | Get stats |
| DELETE | /api/progress/:id | ✅ | Delete log |

✅ = Requires authentication token

---

**All Set!** You now have a production-ready backend with authentication, plan management, and progress tracking. 🎉

Next: Build the React frontend to interact with these APIs.
