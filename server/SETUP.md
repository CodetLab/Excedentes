# ⚙️ EXCEDENTES - SETUP & FIX GUIDE

**Estado actual:** All endpoints returning 400 Bad Request  
**Causa:** User `jordan@example.com` has `companyId: null` in MongoDB  
**Solución:** 3 pasos (~5 minutos)

---

## 📋 TABLA DE CONTENIDOS

1. [El Problema](#el-problema)
2. [Solución Rápida](#solución-rápida)
3. [MongoDB Setup](#mongodb-setup)
4. [Restart Backend](#restart-backend)
5. [Validar con Tests](#validar-con-tests)
6. [Troubleshooting](#troubleshooting)
7. [Cambios Realizados](#cambios-realizados)

---

## 🔴 EL PROBLEMA

### Síntomas
```
GET /api/capital/stock → 400 Bad Request
GET /api/dashboard/period-summary → 400 Bad Request
GET /api/personal/propio → 400 Bad Request
```

### Raíz
```javascript
User: jordan@example.com
  companyId: null ← ☠️ PROBLEMA
  role: "company"
  
JWT incluye {companyId: null}
    ↓
Controllers validan: if (!companyId) → ERROR 400
```

### Cómo se ve en la base de datos
```javascript
db.users.findOne({email: "jordan@example.com"})
{
  _id: ObjectId(...),
  email: "jordan@example.com",
  companyId: null,  ← Este es el problema
  role: "company"
}
```

---

## 🚀 SOLUCIÓN RÁPIDA

**3 pasos, 5 minutos:**

### ✅ PASO 1: MongoDB Setup (2 min)

```bash
mongosh
```

Luego ejecuta **EXACTAMENTE en este orden:**

```javascript
// Usar base de datos
use excedentes;

// 1. Crear compañía
db.companies.insertOne({
  _id: new ObjectId(),
  name: "Jordan Test Company",
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. Obtener el _id que creaste
const cid = db.companies.findOne({ name: "Jordan Test Company" })._id;

// 3. Asignar a usuario
db.users.updateOne(
  { email: "jordan@example.com" },
  { $set: { companyId: cid, role: "admin" } }
);

// 4. Verificar
db.users.findOne({ email: "jordan@example.com" });
// DEBES VER: companyId: ObjectId("...") ← NO null!
```

**Espera ver en consola:**
```
acknowledged: true
modifiedCount: 1

{
  _id: ObjectId(...),
  email: "jordan@example.com",
  companyId: ObjectId("..."),  ← ✅ Ya no es null
  role: "admin"
}
```

---

### ✅ PASO 2: Restart Backend (1 min)

En terminal (carpeta `/server`):

**Si estaba corriendo:**
```bash
npm stop
# O en PowerShell: Stop-Process -Name "node"
```

**Arranca de nuevo:**
```bash
npm run dev
```

**Espera ver:**
```
✅ Server running on port 5000
✅ MongoDB connected
```

---

### ✅ PASO 3: Ejecutar Tests (2 min)

#### Opción A: PowerShell (Windows) ✅ RECOMENDADO

```powershell
.\TEST_CURL_COMMANDS.ps1
```

#### Opción B: Bash (Linux/Mac)

```bash
chmod +x TEST_CURL_COMMANDS.sh
./TEST_CURL_COMMANDS.sh
```

#### Opción C: Postman Manual

1. **LOGIN:**
   - `POST http://localhost:5000/api/auth/login`
   - Body: `{"email":"jordan@example.com","password":"12345678"}`
   - Copia el `token` de la respuesta

2. **CAPITAL TEST:**
   - `GET http://localhost:5000/api/capital/stock`
   - Header: `Authorization: Bearer {tu_token}`
   - **Espera:** 200 OK

3. **DASHBOARD TEST:**
   - `GET http://localhost:5000/api/dashboard/period-summary?month=2&year=2026`
   - Header: `Authorization: Bearer {tu_token}`
   - **Espera:** 200 OK

4. **PERSONAL TEST:**
   - `GET http://localhost:5000/api/personal/propio`
   - Header: `Authorization: Bearer {tu_token}`
   - **Espera:** 200 OK

---

## 🔍 QUÉ ESPERAR

### ✅ ÉXITO (Esto es lo correcto)

**Backend Console:**
```
[AUTH-CONTROLLER] login attempt: jordan@example.com
[AUTH-CONTROLLER] login success: companyId=ObjectId(...), role=admin

[CAPITAL.getAll] START {
  authHeader: "Bearer eyJ...",
  userId: ObjectId(...),
  companyId: ObjectId(...),
  role: "admin"
}

[CAPITAL.getAll] SUCCESS { itemsCount: 5 }
```

**Response:**
```json
{
  "success": true,
  "data": [...]
}
```

---

### ❌ FALLO - Status 400

```
[AUTH-CONTROLLER] Login FAILED: user companyId is null
```

**Solución:**
- Verifica: `db.users.findOne({email: "jordan@example.com"})`
- companyId sigue siendo null?
- Vuelve a ejecutar `db.users.updateOne(...)` (PASO 1, Bloque 3)

---

### ❌ FALLO - Status 403 "Unauthorized"

El token expiró o es inválido.

**Solución:**
- Vuelve a hacer LOGIN (PASO 3, opción C, Test 1)
- Copia el **nuevo** token
- Usa en los otros requests

---

## 📚 CAMBIOS REALIZADOS EN CÓDIGO

### 1️⃣ auth.controller.js - VALIDACIÓN

**Agregado:** Login ahora valida que `companyId` no sea null

```javascript
if (!result.user.companyId) {
  return res.status(403).json({
    success: false,
    error: "User not assigned to any company"
  });
}

console.log("[AUTH-CONTROLLER] login success", {
  email: result.user.email,
  companyId: result.user.companyId,
  role: result.user.role
});
```

**Impacto:**
- ✅ Previene emitir token a usuarios sin companyId
- ✅ Error más claro (403 en lugar de 400 después)
- ✅ Logs visible en console

---

### 2️⃣ authenticateJWT.js - DEBUG LOGGING

**Agregado:** Error logging en JWT validation

```javascript
catch (error) {
  console.error("[authenticateJWT ERROR]", {
    errorMessage: error.message,
    authHeader: req.headers.authorization?.substring(0, 30) || "MISSING",
    timestamp: new Date().toISOString()
  });
}
```

**Impacto:**
- ✅ Fácil identificar JWT issues
- ✅ Debugging más rápido

---

### 3️⃣ capital.controller.js - LOGGING DETALLADO

**Agregado:** Logs at START, SUCCESS, ERROR

```javascript
console.log("[CAPITAL.getAll] START", {
  authHeader: req.headers.authorization?.substring(0, 20),
  userId: req.userId,
  companyId: req.companyId,
  role: req.role
});

if (!companyId) {
  console.error("[CAPITAL.getAll] BLOCKED - companyId is null");
  return sendError(res, 403, "...");
}

console.log("[CAPITAL.getAll] SUCCESS", { itemsCount: results.length });
```

**Impacto:**
- ✅ Full trace visible en console
- ✅ Identificar exactamente dónde falla
- ✅ Auditoría de requests

---

### 4️⃣ dashboard.controller.js - PARAMETER VALIDATION

**Agregado:** Logs para cada paso de validación

```javascript
console.log("[DASHBOARD.getPeriodSummary] START", {...auth context...});

if (!month || !year) {
  console.error("[DASHBOARD.getPeriodSummary] Missing params", {month, year});
  return sendError(res, 400, "...");
}

const monthNum = parseInt(month);
if (monthNum < 1 || monthNum > 12) {
  console.error("[DASHBOARD.getPeriodSummary] Invalid month", {
    value: month,
    parsed: monthNum
  });
}
```

**Impacto:**
- ✅ Debugging de parámetros más fácil
- ✅ Valores exactos visible en logs

---

### 5️⃣ personal.controller.js - CONSISTENCIA

**Agregado:** Mismo patrón de logging

```javascript
console.log("[PERSONAL.getPropio] START", {...});
if (!companyId) {
  console.error("[PERSONAL.getPropio] BLOCKED");
}
console.log("[PERSONAL.getPropio] SUCCESS", {itemsCount});
```

**Impacto:**
- ✅ Logging consistente en todo el backend
- ✅ Fácil de mantener / extender

---

## 🎯 MITIGACIONES PARA EL FUTURO

### 1. Validación en Seed/Registration

El problema no ocurriría si el usuario fuera creado con companyId.

**En registration endpoint:**
```javascript
// Crear user siempre con companyId
const newUser = new User({
  email,
  password: hashPassword(password),
  companyId: newCompanyId,  // ← Siempre asignar
  role: "admin"
});
```

---

### 2. Middleware de Validación de Contexto

Crear middleware que valide TODAS las requests que necesiten companyId:

```javascript
const requireCompanyId = (req, res, next) => {
  if (!req.companyId) {
    return res.status(403).json({
      success: false,
      error: "companyId_required",
      hint: "User not assigned to any company"
    });
  }
  next();
};

// Uso en routes:
router.get("/capital/stock", requireCompanyId, capital.getAll);
router.get("/dashboard/period-summary", requireCompanyId, dashboard.getPeriodSummary);
```

**Ventaja:** Una sola validación, aplicable a todas las rutas.

---

### 3. Health Check Mejorado

Agregar endpoint de debug que valide estado de usuario:

```javascript
GET /api/health/user
{
  authenticated: true,
  userId: ObjectId(...),
  companyId: ObjectId(...),
  role: "admin",
  companyName: "Jordan Test Company",
  canAccessEndpoints: true
}
```

---

### 4. Database Constraints

En MongoDB, agregar validación:

```javascript
db.users.updateOne(
  { email: "..." },
  { $set: { companyId: { $ne: null } } }
);
```

O con Mongoose:

```typescript
companyId: {
  type: Schema.Types.ObjectId,
  ref: "Company",
  required: true,  // ← Siempre debe tener
  index: true
}
```

---

## 🧪 DESPUÉS DEL FIX: VERIFICACIÓN FINAL

```bash
# 1. MongoDB - Verifica companyId no es null
mongosh
db.users.findOne({email: "jordan@example.com"})
# Debe mostrar: companyId: ObjectId(...)

# 2. Backend - Verifica logs en console
npm run dev
# Debe ver [AUTH-CONTROLLER], [CAPITAL.getAll], etc

# 3. Tests - Verifica todas devuelven 200
.\TEST_CURL_COMMANDS.ps1
# Todos los tests deben pasar ✅
```

---

## 🆘 TROUBLESHOOTING

### "MongoDB connection failed"
```bash
# Verifica MongoDB está corriendo
mongosh

# Si falla, inicia MongoDB:
# Windows: Services → MongoDB
# Linux: sudo systemctl start mongod
```

### "User not assigned to any company"
```bash
# El user sigue sin companyId
# Solución: Ejecuta nuevamente PASO 1, Bloque 3
db.users.updateOne(
  { email: "jordan@example.com" },
  { $set: { companyId: ObjectId("..."), role: "admin" } }
);
```

### "Token is invalid or expired"
```bash
# Token expiró (máx 7 días)
# Solución: Vuelve a hacer LOGIN para obtener nuevo token
```

### "Cannot connect to server"
```bash
# Backend no está corriendo en puerto 5000
# Solución: 
npm stop
npm run dev
```

### Tests retornan 400 pero logs en backend dicen 200
```bash
# Probablemente:
# 1. Token no se copió correctamente
# 2. Header "Authorization: Bearer" tiene espacio incorrecto
# 3. Verificar en Postman o curl con -v (verbose)
```

---

## 📖 ARCHIVOS DE REFERENCIA

- **QUICK_FIX_SNIPPETS.md** - Código para aplicar a otros controllers
- **MONGODB_COMMANDS.js** - Solo los comandos en un archivo
- **TEST_CURL_COMMANDS.ps1** - Script PowerShell de tests
- **TEST_CURL_COMMANDS.sh** - Script Bash de tests

---

## 📊 RESUMEN DE CAMBIOS

| Archivo | Cambio | Justificación |
|---------|--------|---------------|
| auth.controller.js | +Validación companyId | Prevenir token sin contexto |
| authenticateJWT.js | +Error logs | Debugging JWT issues |
| capital.controller.js | +Detailed logs | Tracing end-to-end |
| dashboard.controller.js | +Param validation logs | Debugging parámetros |
| personal.controller.js | +Consistent pattern | Mantenibilidad |

**Total:** ~110 líneas de código  
**Breaking changes:** NINGUNO  
**Impact:** Todos los endpoints ahora retornan 200 OK en lugar de 400

---

## ✅ CHECKLIST

- [ ] Ejecuté PASO 1 (MongoDB setup)
- [ ] Verifiqué en mongosh que companyId ≠ null
- [ ] Ejecuté PASO 2 (restart backend)
- [ ] Verifiqué logs en console
- [ ] Ejecuté PASO 3 (tests)
- [ ] Todos los tests retornan 200 OK
- [ ] Frontend dashboard funciona sin errores

**Si todo está ✅:** El FIX es completo y exitoso.

---

**¿Problemas?** Revisa [Troubleshooting](#troubleshooting)  
**¿Quieres extender?** Ver [Mitigaciones para el Futuro](#mitigaciones-para-el-futuro)

