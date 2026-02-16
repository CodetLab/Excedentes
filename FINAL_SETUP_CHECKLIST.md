# ⚙️ CONFIGURACIÓN FINAL - JWT Integration v0.0.5

## 🔴 PROBLEMA DETECTADO

El Frontend está configurado para conectar a la API en producción:
```
VITE_API_URL=https://excedentes-xlbx.onrender.com
```

Pero el backend local está en:
```
http://localhost:5000
```

## ✅ SOLUCIÓN INMEDIATA

### Opción 1: Usar .env.local (Recomendado para desarrollo)

**Crear archivo:** `client/.env.local`

```dotenv
VITE_API_URL=http://localhost:5000
```

Esto sobrescribe `client/.env` solo en desarrollo local.

### Opción 2: Actualizar client/.env para desarrollo

```dotenv
# Development
VITE_API_URL=http://localhost:5000

# Production (comentado para ahora)
# VITE_API_URL=https://excedentes-xlbx.onrender.com
```

## 📋 VERIFICACIÓN DE CONFIGURACIÓN

### Backend
- [ ] `server/` npm start ✅
- [ ] Puerto 5000 activo ✅
- [ ] JWT Middleware registrado ✅
- [ ] Controllers usando req.companyId ✅

### Frontend  
- [ ] `client/` npm run dev ✅
- [ ] VITE_API_URL apunta a localhost:5000 ✅
- [ ] apiClient toma token de excedentes_auth ✅
- [ ] AuthContext persiste token correctamente ✅

## 🔐 FLUJO COMPLETO DE AUTENTICACIÓN JWT

### 1. Frontend Login Component
```
User enters email/password
         ↓
auth.service.ts → fetch("/api/auth/login")
         ↓
Backend validates credentials
         ↓
Backend responds with: { token, user, ... }
         ↓
AuthContext.login() executes:
  - setToken(result.token)
  - persistAuth(token, user, companyId, role)
         ↓
localStorage["excedentes_auth"] = JSON.stringify({
  token: "eyJhbGc...",
  user: {...},
  companyId: "xxx",
  role: "company"
})
```

### 2. Frontend: Llamadas subsecuentes (automáticas)
```
Component: getPeriodSummary(month, year)
  ↓
dashboardService.getPeriodSummary(month, year)
  ↓
apiClient.get("/api/dashboard/period-summary?month=1&year=2026")
  ↓
Interceptor: 
  - Lee localStorage["excedentes_auth"]
  - Extrae token
  - Añade header: Authorization: Bearer <token>
  ↓
GET http://localhost:5000/api/dashboard/period-summary?month=1&year=2026
  Headers:
    Authorization: Bearer eyJhbGc...
```

### 3. Backend: Validar JWT y extraer identidad
```
authenticateJWT middleware:
  - Lee header Authorization: Bearer <token>
  - Verifica firma con getJwtSecret()
  - jwt.verify(token, secret) → decoded
  - Inyecta en request:
    req.userId = decoded.sub
    req.companyId = decoded.companyId
    req.role = decoded.role
    req.email = decoded.email
  ↓
next() → pasa a controller
```

### 4. Controller: Usar identidad del JWT
```
export const getPeriodSummary = asyncHandler(async (req, res) => {
  const companyId = req.companyId;  // ← Del JWT
  if (!companyId) return sendError(res, 403, "...");
  
  const summary = await service.getPeriodSummary(companyId, month, year);
  sendSuccess(res, summary);
});
```

### 5. Service: Filtrar por companyId
```
async getPeriodSummary(companyId, month, year) {
  return Dashboard.findOne({
    companyId,           // ← Aislamiento multi-tenant
    month,
    year
  });
}
```

## 🚀 INICIO RÁPIDO

```bash
# Terminal 1: Backend
cd server
npm start
# Esperado: 🚀 Server running on port 5000

# Terminal 2: Frontend  
cd client
npm run dev
# Esperado: Local: http://localhost:5173
```

Luego:
1. Abre http://localhost:5173
2. Ve a /login (debe ir automáticamente si no autenticado)
3. Ingresa credenciales del test user
4. **ESPERA A VER SI PASA A DASHBOARD**

## ✅ VALIDACIÓN DE ÉXITO

### En el navegador (DevTools F12):

**Application → localStorage:**
```
excedentes_auth: {"token":"eyJhbGc...","user":{...},"companyId":"...","role":"company"}
```

**Network → Panel (todas las requests POST/GET):**
- Cada llamada debe tener header: `Authorization: Bearer eyJhbGc...`
- No debe haber 401 errors ✅

**Console:**
- No debe haber errores de CORS
- No debe haber "Missing authorization header"

**Network → cada GET/POST después de login:**
```
✅ 200 OK - Dashboard loaded
✅ 200 OK - Capital tierras loaded
✅ 200 OK - Personal datos loaded
...
```

## 🔍 DEBUG: Si sigue habiendo 401

### Paso 1: Verificar token en localStorage
```javascript
// En DevTools console
JSON.parse(localStorage.getItem("excedentes_auth"))
// Debe mostrar: { token: "eyJ...", user: {...}, ... }
```

### Paso 2: Verificar token se envía
```javascript
// En DevTools Network tab
// Selecciona cualquier GET a /api/capital/tierras
// Headers → Debe tener:
Authorization: Bearer eyJhbGc...
```

### Paso 3: Verificar backend recibe
Backend logs deben mostrar (si debug activo):
```
[JWT] Token validated: userId=xxx, companyId=yyy, role=company
```

### Paso 4: Probar con curl (backend)
```bash
# Token del localStorage (copiar el valor completo)
TOKEN="eyJhbGc..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/capital/tierras

# Debe retornar 200 con datos, NO 401
```

## 📦 ARCHIVOS MODIFICADOS EN ESTA SESIÓN

### Frontend
- ✅ `client/src/services/apiClient.js` - Lee token del lugar correcto
- ✅ `client/src/services/dashboard.service.ts` - No pasa userId
- ✅ `client/src/services/calculation.service.ts` - No pasa userId  
- ✅ `client/src/pages/Dashboard/Dashboard.tsx` - Llamadas sin userId
- 📝 `client/.env` o `client/.env.local` - Configurar URL correcta

### Backend
- ✅ `server/src/middleware/authenticateJWT.js` - YA está funcionando
- ✅ `server/src/api/controllers/*.js` - Usa req.companyId
- ✅ `server/src/services/*.js` - Filtra por companyId

### Documentación
- ✅ `JWT_INTEGRATION_GUIDE.md` - Guía completa de integración

## 🎯 PRÓXIMOS PASOS

1. **Crear `.env.local`** en client con `VITE_API_URL=http://localhost:5000`
2. **Reiniciar frontend** (`npm run dev`)
3. **Probar login** con credenciales válidas
4. **Verificar dashboard carga** sin 401 errors
5. **Ejecutar test suite** para verificar aislamiento multi-tenant:
   ```bash
   cd server
   npm test -- multi-tenant.spec.js
   ```

## 🐛 Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| 401 Unauthorized | Token no enviado | Verificar env file, localStorage |
| CORS Error | Frontend en :3000, backend en :5000 | Backend tiene CORS habilitado ✅ |
| 403 Forbidden | companyId not in JWT | Verificar login retorna companyId |
| "Cannot find module" | Node modules no instalados | `npm install` en ambas carpetas |
| Network Error | Backend offline | `npm start` en server/ |

---

**Status:** 🟢 Ready for Testing  
**Version:** v0.0.5  
**Date:** 2026-02-16
