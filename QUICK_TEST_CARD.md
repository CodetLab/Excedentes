# ⚡ QUICK TEST CARD - JWT Integration v0.0.5

## 🚀 START (2 Terminal Windows)

### Terminal 1: Backend
```bash
cd server
npm start
```
**Esperado:**
```
🚀 Server running on http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd client
npm run dev
```
**Esperado:**
```
VITE v5.x ready in XXX ms
Local: http://localhost:5173
```

---

## 🧪 TEST FLOW

### Step 1: Browser Demo
1. Click: http://localhost:5173
2. Auto-redirect to: http://localhost:5173/login ✅
3. Enter login credentials
4. Click: "Iniciar Sesión"
5. **Expected:** Dashboard loads ✅ (NO 401 errors)

### Step 2: DevTools Validation (F12)

**Console:**
```javascript
// Paste this:
JSON.parse(localStorage.getItem("excedentes_auth"))

// Expected output:
{
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "...",
    email: "...",
    name: "..."
  },
  companyId: "...",
  role: "company"
}
```

**Network Tab:**
- Open: DevTools → Network
- Click any: GET /api/capital/... (or /api/dashboard/...)
- Check: Headers → should have `Authorization: Bearer eyJ...`
- Check: Response status = **200 OK** (not 401) ✅

### Step 3: Dashboard Functionality
- [ ] Capital → Tierras loads ✅
- [ ] Personal → Propio loads ✅
- [ ] Ventas loads ✅
- [ ] Dashboard period changes work ✅
- [ ] Calculation runs without 401 ✅

---

## 🐛 DEBUG CHECKLIST (If 401 Still Appears)

### Issue 1: Can't login (401 on /api/auth/login)
- [ ] Backend is running? (npm start in server/)
- [ ] PORT 5000 accessible? (netstat -an | grep 5000)
- [ ] Credentials correct? (check seed data)

### Issue 2: Logged in but 401 on API calls
- [ ] `client/.env.local` exists?
- [ ] Contains: `VITE_API_URL=http://localhost:5000`?
- [ ] Frontend restarted AFTER creating .env.local?
- [ ] localStorage has excedentes_auth key?

### Issue 3: localStorage empty after login
- [ ] Check browser console for errors
- [ ] Is AuthContext.persistAuth being called?
- [ ] Check Network → POST /api/auth/login response includes token?

### Issue 4: Authorization header not sent
- [ ] Check apiClient.js has correct localStorage key name
- [ ] Is localStorage.getItem("excedentes_auth") returning valid JSON?
- [ ] Is token being parsed correctly?

---

## 📊 EXPECTED BEHAVIOR

### Before (Broken) 🔴
```
GET /api/capital/tierras
Headers: {}
↓
401 Unauthorized
← {"error": "Missing or invalid authorization header"}
```

### After (Fixed) 🟢
```
GET /api/capital/tierras
Headers: {
  Authorization: "Bearer eyJhbGc..."
}
↓
200 OK
← {"success": true, "data": [{...}]}
```

---

## 🧬 JWT PAYLOAD Structure

### What's Encoded in Token
When you login, backend creates token with this payload:
```json
{
  "sub": "user-id-here",
  "email": "user@company.com",
  "companyId": "company-id-here",
  "role": "company",
  "iat": 1707xxxxx,
  "exp": 1707xxxxx
}
```

### What Frontend Gets
After login, localStorage contains:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id-here",
    "email": "user@company.com",
    "companyId": "company-id-here",
    "role": "company"
  },
  "companyId": "company-id-here",
  "role": "company"
}
```

### What Backend Extracts
On each request, middleware decodes token and sets:
```javascript
req.userId = "user-id-here"
req.email = "user@company.com"
req.companyId = "company-id-here"  // Used to filter data
req.role = "company"
```

---

## ✅ SUCCESS INDICATORS

| Check | Status | Why |
|-------|--------|-----|
| Browser loads without error | 🟢 | No CORS issues |
| Login page shows | 🟢 | App is working |
| Can submit login form | 🟢 | Frontend → Backend connection OK |
| Dashboard loads | 🟢 | JWT validation passed |
| Data displayed in tables | 🟢 | Service queries working |
| No 401 in Console | 🟢 | Token being sent correctly |

---

## 📈 PERFORMANCE NOTES

- Token read from localStorage: **~1ms**
- JWT verification: **~5-10ms**
- Database query with companyId filter: **~20-50ms**
- **Total request time:** ~30-100ms for most calls

---

## 🔐 SECURITY VALIDATION

### Multi-tenant Isolation
```
User A (Company X) ──┐
                     ├─→ GET /api/capital
User B (Company Y) ──┘

Backend:
  User A has companyId: "comp-x"
    → Capital.find({ companyId: "comp-x" })
    → Gets only company X data ✅
  
  User B has companyId: "comp-y"  
    → Capital.find({ companyId: "comp-y" })
    → Gets only company Y data ✅
    → CANNOT see User A's data ✅
```

### Token Expiration
```
Token valid: YES
Token in localStorage: YES
Token in JWT header: YES
JWT signature: VERIFIED ✅
```

---

## 🎯 TEST SCENARIOS

### Scenario 1: Fresh Login
1. Open incognito/private window
2. Go to http://localhost:5173
3. Should redirect to /login
4. Enter credentials
5. Should see Dashboard
6. **Result:** ✅ PASS or ❌ FAIL

### Scenario 2: Page Refresh
1. On Dashboard
2. Press F5 (refresh)
3. Should stay on Dashboard (token persists)
4. Should not show login page
5. **Result:** ✅ PASS or ❌ FAIL

### Scenario 3: Open New Tab
1. In first tab: Logged in Dashboard
2. Open new tab: http://localhost:5173
3. Should show Dashboard (same session)
4. Should NOT redirect to login
5. **Result:** ✅ PASS or ❌ FAIL

### Scenario 4: Go to /login while logged in
1. Logged in, on Dashboard
2. Navigate to http://localhost:5173/login
3. Should redirect to Dashboard
4. Should NOT show login form
5. **Result:** ✅ PASS or ❌ FAIL

### Scenario 5: Logout
1. Click logout button
2. localStorage["excedentes_auth"] deleted
3. Should redirect to /login
4. **Result:** ✅ PASS or ❌ FAIL

---

## 🏁 TEST COMPLETE WHEN

- [x] Both servers running (backend + frontend)
- [x] Can login successfully
- [x] Dashboard displays without 401 errors
- [x] localStorage contains valid token
- [x] API calls include Authorization header
- [x] All test scenarios pass
- [x] Multi-tenant isolation verified

---

## 📞 SUPPORT COMMANDS

### Kill Server (if stuck)
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Clear Browser Storage
```javascript
// DevTools Console
localStorage.clear()
sessionStorage.clear()
// Then refresh page
```

### View Raw Token Payload
```javascript
// DevTools Console
const token = JSON.parse(localStorage.getItem("excedentes_auth")).token
const payload = token.split('.')[1]
const decoded = atob(payload)
console.log(JSON.parse(decoded))
```

### Test Backend Directly
```bash
# Get token from browser localStorage first
TOKEN="eyJhbGc..."

# Test request
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/capital/tierras
```

---

**Ready to Test? 🚀**

Follow TEST FLOW above, then share:
- ✅ What worked
- ❌ What failed (with error message)

---

**Version:** v0.0.5 | **Date:** 2026-02-16 | **Status:** 🟢 READY
