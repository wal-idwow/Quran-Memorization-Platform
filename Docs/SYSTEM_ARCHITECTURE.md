# Complete System Architecture & Integration Guide

## 🏗️ Full System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Auth Pages         │ Dashboard      │ Progress Tracker    │   │
│  │ - Login            │ - My Plans     │ - Daily Log         │   │
│  │ - Signup           │ - Create Plan  │ - Statistics        │   │
│  │ - Profile          │ - View Plan    │ - Streak Display    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                    │                │                │            │
│   HTTP Requests    │ JWT Token in    │ JSON          │ Auth       │
│   (JSON)           │ Authorization   │ Payloads      │ Token      │
└────────────────────┼────────────────┼───────────────┼────────────┘
                     ↓                ↓               ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS SERVER (Node.js)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HTTP Requests with JWT Token                           │   │
│  │  ↓                                                       │   │
│  │  Auth Middleware                                         │   │
│  │  └─→ Verify JWT with Supabase                          │   │
│  │      Extract user_id                                    │   │
│  │      Attach to req.user                                │   │
│  │                                                          │   │
│  │  Route Handlers                                          │   │
│  │  ├─ /api/auth/* → UserService                          │   │
│  │  ├─ /api/plans/* → PlanService                         │   │
│  │  └─ /api/progress/* → ProgressService                 │   │
│  │                                                          │   │
│  │  Services                                                │   │
│  │  ├─ UserService (auth operations)                      │   │
│  │  ├─ PlanService (database CRUD)                        │   │
│  │  ├─ ProgressService (logging & stats)                 │   │
│  │  └─ PlanGeneratorService (algorithm)                  │   │
│  │                                                          │   │
│  │  Middleware                                              │   │
│  │  ├─ Error Handler (catch all errors)                  │   │
│  │  ├─ Zod Validator (validate inputs)                   │   │
│  │  └─ Async Wrapper (safe error catching)               │   │
│  │                                                          │   │
│  │  Responses                                               │   │
│  │  └─ JSON {success, data/error, message}               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
                     ↓               ↓               ↓
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE / POSTGRESQL                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Authentication                                          │   │
│  │  ├─ auth.users (Supabase managed)                       │   │
│  │  └─ JWT token validation                                │   │
│  │                                                          │   │
│  │  Database                                                │   │
│  │  ├─ users (profiles, preferences)                       │   │
│  │  ├─ plans (memorization plans + full data)             │   │
│  │  └─ progress_logs (daily entries + scores)            │   │
│  │                                                          │   │
│  │  Security                                                │   │
│  │  ├─ Row-Level Security (RLS) policies                 │   │
│  │  └─ Each user only sees own data                       │   │
│  │                                                          │   │
│  │  Real-time (optional)                                   │   │
│  │  └─ WebSocket support for live updates                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow Example

### Example: Create a Memorization Plan

**1. User submits form (Frontend)**
```json
{
  "surahNumber": 18,
  "startVerse": 1,
  "endVerse": 110,
  "durationDays": 30,
  "planName": "Surah Al-Kahf"
}
```

**2. Frontend sends HTTP request with auth**
```
POST /api/plans HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{...plan data...}
```

**3. Server receives request**
```
Express middleware:
1. Parse JSON body
2. Auth middleware verifies JWT
3. Extract user_id from token
4. Pass to route handler
```

**4. Route handler processes**
```typescript
// In src/routes/plans.routes.ts
router.post(
  '/',
  verifyAuth,  // ← JWT verified here, user_id attached
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const validated = GeneratePlanSchema.parse(req.body);
    // ↑ Zod validates input
    
    const plan = PlanGeneratorService.generatePlan(...);
    // ↑ Algorithm generates plan
    
    const result = await PlanService.savePlan(req.user.id, plan);
    // ↑ Service saves to database
    
    res.status(201).json(result);
    // ↑ Send response to frontend
  })
);
```

**5. Service layer saves to database**
```typescript
// In src/services/plan.service.ts
static async savePlan(userId: string, plan: MemorizationPlan) {
  const { data, error } = await supabaseClient
    .from('plans')
    .insert({
      user_id: userId,      // ← From JWT
      plan_name: plan.planName,
      plan_data: plan,      // ← Full plan JSON
      surah_number: plan.targetSurah.number,
      status: 'active',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  return { success: true, plan: data };
}
```

**6. Database stores data (RLS policy checks)**
```sql
-- Row-Level Security Policy
CREATE POLICY "Users can insert own plans"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  -- ↑ Ensures user_id matches JWT user_id
```

**7. Server sends response (Frontend)**
```json
{
  "success": true,
  "message": "Plan created and saved successfully",
  "plan": {
    "id": "plan_abc123",
    "user_id": "user_550e8400...",
    "plan_name": "Surah Al-Kahf",
    "surah_number": 18,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**8. Frontend updates UI**
- Show success message
- Add plan to list
- Navigate to plan details

---

## 🔐 Security Layers

### Layer 1: JWT Token
```
When user logs in:
1. Username + password sent to /api/auth/login
2. Supabase verifies credentials
3. JWT token generated and returned
4. Frontend stores token
5. Token included in future requests

Token structure:
header.payload.signature
  ↓
{
  "sub": "user_id",
  "aud": "authenticated",
  "iat": 1234567890,
  "exp": 1234571490  // Expires in 1 hour
}
```

### Layer 2: Server-Side Verification
```typescript
// In middleware/auth.middleware.ts
const { data, error } = await supabaseClient.auth.getUser(token);
// ↑ Supabase verifies JWT signature and expiration
// ↑ Returns user only if token is valid

if (error || !data.user) {
  throw new ApiError(401, 'Invalid or expired token');
}

req.user = { id: data.user.id, email: data.user.email };
```

### Layer 3: Row-Level Security (Database)
```sql
-- Example RLS policy for plans table
CREATE POLICY "Users can view own plans"
  ON public.plans FOR SELECT
  USING (auth.uid() = user_id);
  
-- Even if someone got to database directly,
-- they can only see their own plans
```

### Layer 4: Input Validation
```typescript
// Zod validates request shape before processing
const validated = GeneratePlanSchema.parse(req.body);
// ↑ Throws error if:
//   - Missing required fields
//   - Wrong data types
//   - Values out of range
```

---

## 📊 Data Flow Diagram

```
User Actions          HTTP Request       Server Processing      Database        Response
────────────────────────────────────────────────────────────────────────────────────────

User fills           POST /api/plans
signup form     ──→  with JWT token  ──→ Auth Middleware  ──→ Verify JWT  ──→ Token valid
                                         Verify JWT
                                         ↓
User clicks              │              Zod Schema           ↓
Signup button       ──→  │              Validate input   ──→ Validate  ──→ Valid
                         │              ↓
                         │              PlanGeneratorService ──→ Generate  ──→ Generated
                         │              Generate plan
                         │              ↓
                         │              PlanService         ──→ INSERT INTO
                         │              Save to database         plans
                         │                                  ↓
                         │                                  Return
                         │                                  new id
                         │              ↓
                         └──────────── Response JSON ←────────────
                                        {success: true, plan}
                         
                         ↓
Frontend displays    Success message,
success             show plan in list
```

---

## 🔌 Integration Points

### For Frontend Developers

**1. Authentication Flow**
```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { session } = await response.json();
localStorage.setItem('token', session.accessToken);

// Later requests
const response = await fetch('/api/plans', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

**2. Error Handling**
```typescript
// All errors follow this format
{
  "success": false,
  "error": "Invalid email address",
  "code": "VALIDATION_ERROR",
  "details": [...]
}

// Handle in frontend
if (!response.ok) {
  const error = await response.json();
  showError(error.error);
}
```

**3. Protected Routes**
```typescript
// Only show if user is authenticated
{userToken ? <Dashboard /> : <LoginPage />}

// Or use a route guard
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

---

## 📝 File Organization

```
Quran-Platform/
├── src/
│   ├── database/
│   │   └── supabase.ts              # Database connection
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification
│   │   └── error.middleware.ts      # Error handling
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           # /api/auth endpoints
│   │   ├── plans.routes.ts          # /api/plans endpoints
│   │   └── progress.routes.ts       # /api/progress endpoints
│   │
│   ├── services/
│   │   ├── user.service.ts          # User operations
│   │   ├── plan.service.ts          # Plan operations
│   │   ├── progress.service.ts      # Progress operations
│   │   ├── plan-generator.service.ts # (existing)
│   │   └── [future services]
│   │
│   ├── schemas/
│   │   └── validation.schema.ts     # Zod schemas
│   │
│   ├── types/
│   │   └── memorization-plan.types.ts
│   │
│   ├── server.ts                    # Main server
│   └── index.ts                     # (existing)
│
├── docs/
│   ├── DATABASE_SETUP.md
│   ├── API_DOCUMENTATION.md
│   ├── PHASE2_IMPLEMENTATION.md
│   ├── PHASE2_QUICKSTART.md
│   └── PHASE2_SUMMARY.md
│
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use HTTPS (SSL certificate)
- [ ] Set strong JWT secret (Supabase handles this)
- [ ] Enable CORS for frontend domain
- [ ] Set up rate limiting
- [ ] Enable monitoring/logging
- [ ] Set up database backups
- [ ] Test all endpoints
- [ ] Set up CI/CD pipeline
- [ ] Document API changes

### Production Environment Variables

```env
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=prod-key-here
SUPABASE_SERVICE_ROLE_KEY=prod-service-key-here
PORT=3000
FRONTEND_URL=https://yourdomain.com
```

---

## 🔍 Common Debugging

### "Token is invalid"
→ Token expired or user logged out
→ Solution: Show login page, user logs in again

### "RLS policy error"
→ User trying to access someone else's data
→ Solution: Check RLS policies in Supabase

### "Validation error"
→ Frontend sent wrong data type or format
→ Solution: Check Zod schema in API_DOCUMENTATION.md

### "Streak not calculating"
→ Check progress logs exist for plan
→ Solution: Make sure sabaq_completed is true

---

## 📞 Architecture Support

For issues with:
- **Database**: See DATABASE_SETUP.md
- **API Endpoints**: See API_DOCUMENTATION.md
- **Integration**: See this file + PHASE2_IMPLEMENTATION.md
- **Setup**: See PHASE2_QUICKSTART.md

---

## ✅ Complete Feature Matrix

| Feature | Status | Endpoint | Docs |
|---------|--------|----------|------|
| User Registration | ✅ | POST /api/auth/signup | API_DOCUMENTATION.md |
| User Login | ✅ | POST /api/auth/login | API_DOCUMENTATION.md |
| User Logout | ✅ | POST /api/auth/logout | API_DOCUMENTATION.md |
| Profile View | ✅ | GET /api/auth/profile | API_DOCUMENTATION.md |
| Profile Update | ✅ | PUT /api/auth/profile | API_DOCUMENTATION.md |
| Plan Creation | ✅ | POST /api/plans | API_DOCUMENTATION.md |
| Plan List | ✅ | GET /api/plans | API_DOCUMENTATION.md |
| Plan Details | ✅ | GET /api/plans/:id | API_DOCUMENTATION.md |
| Plan Update | ✅ | PUT /api/plans/:id | API_DOCUMENTATION.md |
| Plan Delete | ✅ | DELETE /api/plans/:id | API_DOCUMENTATION.md |
| Progress Logging | ✅ | POST /api/progress/log | API_DOCUMENTATION.md |
| Progress History | ✅ | GET /api/progress/:id | API_DOCUMENTATION.md |
| Statistics | ✅ | GET /api/progress/:id/stats | API_DOCUMENTATION.md |
| Streak Calculation | ✅ | Auto (in progress log) | PHASE2_IMPLEMENTATION.md |
| Surahs List | ✅ | GET /api/surahs | API_DOCUMENTATION.md |

---

This complete system is ready for Phase 3: Frontend UI development.

See **PHASE2_QUICKSTART.md** to get started.
