# 🔐 JWT Integration Guide - v0.0.5 Multi-Tenant

## ✅ Problem Solved

**Before (Broken):**
```
Client                          Server
│                               │
├─ GET /api/capital/tierras    ├─ No Authorization header
│  (missing JWT)                │
│  401 Unauthorized ◄──────────┤
```

**After (Fixed):**
```
Client                          Server
│                               │
├─ localStorage: excedentes_auth
│  ├─ token: "eyJhbGc..." ───────────┐
│  ├─ user: {id, email, ...}        │
│  ├─ companyId: "xxx"              │
│  └─ role: "company"               │
│                                   │
├─ GET /api/capital/tierras ────────┤
│  Headers:                          │
│  Authorization: Bearer eyJhbGc...  │
│                                   │
│  ┌─────────────────────────────────┤
│  │ JWT Middleware (authenticateJWT)
│  │  ├─ Extract token from header
│  │  ├─ Verify signature
│  │  ├─ req.userId = decoded.sub
│  │  ├─ req.companyId = decoded.companyId
│  │  ├─ req.role = decoded.role
│  │  └─ req.email = decoded.email
│  │
│  ├─ Capital Controller ◄───────────┤
│  │  const companyId = req.companyId (from JWT)
│  │  const items = await service.getAll(companyId)
│  │
│  └─ 200 OK {data: [...]} ─────────┤
│                                   │
└─────────────────────────────────→┘
```

## 🔌 Integration Points

### 1️⃣ Frontend: apiClient.js (Token Provider)
**Location:** `client/src/services/apiClient.js`

```javascript
apiClient.interceptors.request.use((config) => {
  // ✅ Fixed: Now reads from correct localStorage key
  const authData = localStorage.getItem("excedentes_auth"); // JSON data
  if (authData) {
    const parsed = JSON.parse(authData);
    const token = parsed.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
```

**Change Made:**
- Before: `localStorage.getItem("token")` ❌
- After: `localStorage.getItem("excedentes_auth")` + parse JSON ✅

### 2️⃣ Frontend: AuthContext.tsx (Token Storage)
**Location:** `client/src/context/AuthContext.tsx`

```typescript
const storageKey = "excedentes_auth"; // Single key for all auth state

const persistAuth = (
  token: string | null,
  user: AuthUser | null,
  companyId: string | null,
  role: "admin" | "company" | null
) => {
  localStorage.setItem(storageKey, JSON.stringify({ 
    token, user, companyId, role 
  }));
};
```

**After Login:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "userid123", "email": "user@company.com", ... },
  "companyId": "company456",
  "role": "company"
}
```

### 3️⃣ Backend: authenticateJWT Middleware
**Location:** `server/src/middleware/authenticateJWT.js`

```javascript
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing JWT" });
  }

  const token = authHeader.slice(7); // Remove "Bearer "
  const decoded = jwt.verify(token, getJwtSecret());

  // Inject into request
  req.userId = decoded.sub;           // From JWT.sub
  req.companyId = decoded.companyId;  // From JWT.companyId
  req.role = decoded.role;             // From JWT.role
  req.email = decoded.email;           // From JWT.email
  
  next();
};
```

**Applied To:** All protected routes via Express middleware

### 4️⃣ Frontend: Service Layer (No userId Parameter)
**Location:** `client/src/services/*.ts`

**Before (Broken):**
```typescript
// ❌ Passing userId as parameter - server doesn't use it
await dashboardService.getPeriodSummary(user.id, month, year);
// Request: GET /api/dashboard/period-summary?userId=xxx&month=1&year=2026
```

**After (Fixed):**
```typescript
// ✅ userId extracted from JWT automatically
await dashboardService.getPeriodSummary(month, year);
// Request: GET /api/dashboard/period-summary?month=1&year=2026
// Header: Authorization: Bearer eyJhbGc...
// Server gets userId from req.userId (JWT decoded)
```

**Files Updated:**
- `dashboard.service.ts`: Removed userId from getPeriodSummary()
- `calculation.service.ts`: Removed userId from calculateByPeriod()
- `Dashboard.tsx`: Updated service calls

### 5️⃣ Backend: Controllers (Using req.companyId)
**Location:** `server/src/api/controllers/*.js`

```javascript
export const getAll = asyncHandler(async (req, res) => {
  const companyId = req.companyId; // ✅ From JWT middleware
  
  if (!companyId) {
    return sendError(res, 403, "companyId requerido");
  }

  const items = await service.getAll(companyId);
  sendSuccess(res, items);
});
```

## 🧪 Testing the Flow

### 1. Login
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "email": "user@company.com",
      "companyId": "company456",
      "role": "company"
    }
  }
}
```

**Frontend stores in localStorage:**
```json
{
  "excedentes_auth": "{\"token\":\"eyJhbGc...\",\"user\":{...},\"companyId\":\"company456\",\"role\":\"company\"}"
}
```

### 2. Protected Request (with auto-added JWT)
```bash
GET http://localhost:5000/api/capital/tierras
# apiClient automatically adds:
# Authorization: Bearer eyJhbGc...
```

**Backend processing:**
1. authenticateJWT middleware validates token
2. Extracts `userId`, `companyId`, `role`, `email` from JWT payload
3. Attaches to `req.userId`, `req.companyId`, etc.
4. Controller uses `req.companyId` to filter data
5. Returns only data belonging to that company

## 🔒 Security Features

### Multi-Tenant Isolation
```
User A (Company X)      User B (Company Y)
│                       │
├─ token includes       ├─ token includes
│  companyId: "comp-x"  │  companyId: "comp-y"
│                       │
├─ Request capital      ├─ Request capital
│  JWT decoded ──┐      │  JWT decoded ──┐
│               ↓      │               ↓
│  req.companyId        │  req.companyId
│  = "comp-x"           │  = "comp-y"
│               ↓      │               ↓
│  Service filters:     │  Service filters:
│  Capital.find({      │  Capital.find({
│    companyId: "comp-x"  Capital.find({
│  })                   │    companyId: "comp-y"
│                       │  })
│  ✅ Returns only X's data ❌ Cannot see Y's data
```

### No Data Leakage
```javascript
// ✅ Correct: Controller validates JWT identity
if (!req.companyId) return sendError(res, 403, "..."); 

// ✅ Correct: Service filters all queries
Capital.find({ companyId: req.companyId })

// ❌ Never: Trust client-provided IDs
const items = Capital.find({ _id: req.query.id }); // WRONG!
```

## 📋 Checklist

- [x] apiClient reads token from correct localStorage key
- [x] AuthContext persists token properly
- [x] Frontend services don't pass userId anymore
- [x] Backend middleware extracts userId from JWT
- [x] Controllers validate companyId is present
- [x] Services filter all queries by companyId
- [x] Tests cover multi-tenant isolation

## 🚀 What's Next

To test the complete flow:

```bash
# 1. Start backend
cd server && npm start

# 2. Start frontend
cd client && npm run dev

# 3. Login
# - Navigate to login page
# - Enter credentials
# - Check browser DevTools → Application → localStorage
#   Should see "excedentes_auth" with token

# 4. Access protected pages
# - Dashboard should load ✅
# - Capital/Tierras should load ✅
# - All 401 errors should be resolved ✅

# 5. Run tests
npm test -- multi-tenant.spec.js
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────┐
│ Browser                                 │
│  localStorage: excedentes_auth          │
│   ├─ token                              │
│   ├─ user.id                            │
│   ├─ companyId                          │
│   └─ role                               │
└─────────────────────────────────────────┘
               │
               │ apiClient reads token
               ↓
┌─────────────────────────────────────────┐
│ axios interceptor (request)             │
│  Authorization: Bearer <token>          │
└─────────────────────────────────────────┘
               │
               │ HTTP request
               ↓
┌─────────────────────────────────────────┐
│ Server                                  │
│  Express middleware: authenticateJWT    │
│   ├─ Extract token from header          │
│   ├─ Verify & decode JWT                │
│   ├─ req.userId = decoded.sub           │
│   ├─ req.companyId = decoded.companyId  │
│   └─ req.role = decoded.role            │
└─────────────────────────────────────────┘
               │
               │ Request flows to controller
               ↓
┌─────────────────────────────────────────┐
│ Controller (capital.controller.js)      │
│  const companyId = req.companyId;       │
│  if (!companyId) return 403;            │
│  const items = service.getAll(companyId)│
└─────────────────────────────────────────┘
               │
               │ Delegates to service
               ↓
┌─────────────────────────────────────────┐
│ Service (capital.service.js)            │
│  Capital.find({ companyId })            │
│  ✅ Returns only this company's data    │
└─────────────────────────────────────────┘
```

## 🐛 Troubleshooting

### Issue: Still getting 401 errors
**Solution:**
1. Check browser DevTools → Network tab → request headers
2. Verify `Authorization: Bearer ...` is present
3. Check localStorage has `excedentes_auth` key
4. If missing, user isn't logged in - redirect to /login

### Issue: Getting 403 instead of data
**Solution:**
1. JWT is valid (auth passed) but companyId check failed
2. Check JWT contains companyId: `jwt.io` decode the token
3. Verify backend assigned companyId during registration/login

### Issue: Seeing other company's data
**Solution:**
1. Service layer not filtering by companyId
2. Check service method signature has companyId parameter
3. Verify all queries use: `Model.find({ companyId, ... })`

---

**Version:** v0.0.5  
**Date:** 2026-02-16  
**Status:** ✅ Implementation Complete
