# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Success message (optional)"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* validation errors */ }
}
```

## Authentication

Protected endpoints require an Authorization header with a Bearer token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

Get a token by logging in (see Auth endpoints below).

---

## Authentication Endpoints

### POST /auth/signup

Register a new user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "Ahmed Hassan",
    "language": "ar"
  }'
```

**Required Fields:**
- `email` (string): Valid email address
- `password` (string): Minimum 8 characters
- `fullName` (string): User's full name
- `language` (string, optional): "en" or "ar" (default: "en")

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully. Please check your email.",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Ahmed Hassan"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation Error",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "code": "too_small",
      "minimum": 8,
      "type": "string",
      "path": ["password"],
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### POST /auth/login

Login a user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "session": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "sbv2_QkDHy_example...",
    "expiresIn": 3600
  },
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  }
}
```

---

### POST /auth/logout

Logout the current user.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /auth/profile

Get the current user's profile.

**Request:**
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "fullName": "Ahmed Hassan",
    "language": "ar"
  }
}
```

---

### PUT /auth/profile

Update the current user's profile.

**Request:**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullName": "Ahmed Hassan Al-Hashim",
    "language": "ar"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "Ahmed Hassan Al-Hashim",
    "language": "ar",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
  }
}
```

---

## Plan Endpoints

### POST /plans

Create and save a new memorization plan.

**Request:**
```bash
curl -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "surahNumber": 18,
    "startVerse": 1,
    "endVerse": 110,
    "durationDays": 30,
    "planName": "Surah Al-Kahf 30-Day Challenge"
  }'
```

**Required Fields:**
- `surahNumber` (number): 1-114
- `startVerse` (number): Minimum 1
- `endVerse` (number): Minimum 1, must be ≥ startVerse
- `durationDays` (number): 7-365
- `planName` (string, optional): Custom plan name

**Success Response (201):**
```json
{
  "success": true,
  "message": "Plan created and saved successfully",
  "plan": {
    "id": "plan_abc123",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "plan_name": "Surah Al-Kahf 30-Day Challenge",
    "plan_data": { /* full MemorizationPlan object */ },
    "surah_number": 18,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### GET /plans

Get all plans for the current user.

**Request:**
```bash
curl "http://localhost:3000/api/plans?status=active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `status` (optional): "active", "completed", "paused", or "abandoned"

**Success Response (200):**
```json
{
  "success": true,
  "plans": [
    {
      "id": "plan_abc123",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "plan_name": "Surah Al-Kahf 30-Day Challenge",
      "surah_number": 18,
      "start_verse": 1,
      "end_verse": 110,
      "duration_days": 30,
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

---

### GET /plans/:planId

Get a specific plan by ID.

**Request:**
```bash
curl "http://localhost:3000/api/plans/plan_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "plan": {
    "id": "plan_abc123",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "plan_name": "Surah Al-Kahf 30-Day Challenge",
    "plan_data": { /* complete MemorizationPlan object */ },
    "surah_number": 18,
    "status": "active",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### PUT /plans/:planId

Update a plan's status.

**Request:**
```bash
curl -X PUT "http://localhost:3000/api/plans/plan_abc123" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

**Valid Status Values:**
- `active`
- `completed`
- `paused`
- `abandoned`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan updated successfully",
  "plan": {
    "id": "plan_abc123",
    "status": "completed",
    "updated_at": "2024-01-20T15:45:00Z"
  }
}
```

---

### DELETE /plans/:planId

Delete a plan.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/plans/plan_abc123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Plan deleted successfully"
}
```

---

## Progress Endpoints

### POST /progress/log

Log daily progress for a plan.

**Request:**
```bash
curl -X POST "http://localhost:3000/api/progress/log" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "planId": "plan_abc123",
    "day": 1,
    "sabaqCompleted": true,
    "sabaqVerses": 4,
    "sabaqRetentionScore": 85,
    "manzilCompleted": [],
    "manzilRetentionScores": {},
    "sessionDuration": 20,
    "notesOrChallenges": "Good progress, remembered most verses"
  }'
```

**Required Fields:**
- `planId` (string UUID): Plan to log for
- `day` (number): Day number (≥ 1)
- `sabaqCompleted` (boolean): Was new lesson completed?
- `sabaqRetentionScore` (number): 0-100
- `sessionDuration` (number): Minutes spent

**Optional Fields:**
- `sabaqVerses` (number): Number of verses memorized
- `manzilCompleted` (array): Revisions completed
- `manzilRetentionScores` (object): Revision scores
- `notesOrChallenges` (string): Additional notes

**Success Response (201):**
```json
{
  "success": true,
  "message": "Progress logged successfully",
  "progress": {
    "id": "progress_def456",
    "plan_id": "plan_abc123",
    "day": 1,
    "date": "2024-01-15",
    "sabaq_completed": true,
    "sabaq_retention_score": 85,
    "session_duration": 20,
    "created_at": "2024-01-15T10:45:00Z"
  },
  "streak": 1
}
```

---

### GET /progress/:planId

Get all progress logs for a plan.

**Request:**
```bash
curl "http://localhost:3000/api/progress/plan_abc123?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
- `limit` (number, optional): Results per page (default: 50, max: 100)
- `offset` (number, optional): Results to skip (default: 0)

**Success Response (200):**
```json
{
  "success": true,
  "progress": [
    {
      "id": "progress_def456",
      "plan_id": "plan_abc123",
      "day": 1,
      "date": "2024-01-15",
      "sabaq_completed": true,
      "sabaq_retention_score": 85,
      "session_duration": 20,
      "notes": "Good progress",
      "created_at": "2024-01-15T10:45:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 15
  }
}
```

---

### GET /progress/:planId/stats

Get statistics for a plan.

**Request:**
```bash
curl "http://localhost:3000/api/progress/plan_abc123/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalDaysCompleted": 5,
    "averageRetentionScore": 82,
    "totalSessionMinutes": 105,
    "streak": 5,
    "totalLogsRecorded": 5
  }
}
```

---

### DELETE /progress/:progressId

Delete a specific progress log.

**Request:**
```bash
curl -X DELETE "http://localhost:3000/api/progress/progress_def456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Progress log deleted"
}
```

---

## Public Endpoints

### GET /api/surahs

Get all available Surahs (no authentication required).

**Request:**
```bash
curl "http://localhost:3000/api/surahs"
```

**Success Response (200):**
```json
{
  "success": true,
  "surahs": [
    {
      "number": 1,
      "name": "Al-Fatihah",
      "arabicName": "الفاتحة",
      "totalVerses": 7
    },
    {
      "number": 2,
      "name": "Al-Baqarah",
      "arabicName": "البقرة",
      "totalVerses": 286
    }
    // ... more surahs
  ],
  "count": 114
}
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTH_ERROR` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Not authorized to access resource |
| `NOT_FOUND` | 404 | Resource not found |
| `LOGIN_ERROR` | 401 | Login failed |
| `SIGNUP_ERROR` | 400 | Signup failed |
| `SAVE_ERROR` | 500 | Failed to save |
| `FETCH_ERROR` | 500 | Failed to fetch |
| `UPDATE_ERROR` | 500 | Failed to update |
| `DELETE_ERROR` | 500 | Failed to delete |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

Not currently implemented. Will be added in production:
- 100 requests per minute per user
- 1000 requests per hour per IP

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** in HTTP-only cookies or secure storage
3. **Validate input** on both client and server
4. **Handle errors gracefully** with user-friendly messages
5. **Log API calls** for debugging and monitoring
6. **Refresh tokens** before they expire (typically 1 hour)

---

## Examples

### Complete Flow Example

```bash
#!/bin/bash

# 1. Sign up
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "Ahmed Hassan"
  }')

# 2. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.session.accessToken')

# 3. Create a plan
PLAN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "surahNumber": 18,
    "startVerse": 1,
    "endVerse": 110,
    "durationDays": 30,
    "planName": "Surah Al-Kahf 30-Day Challenge"
  }')

PLAN_ID=$(echo $PLAN_RESPONSE | jq -r '.plan.id')

# 4. Log progress
curl -s -X POST http://localhost:3000/api/progress/log \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "planId": "'$PLAN_ID'",
    "day": 1,
    "sabaqCompleted": true,
    "sabaqRetentionScore": 85,
    "sessionDuration": 20
  }'

# 5. Get statistics
curl -s "http://localhost:3000/api/progress/$PLAN_ID/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for environment configuration details.
