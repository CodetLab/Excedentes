# ⚡ NEXT ACTIONS: v0.0.7 + v0.0.8 IMPLEMENTATION

**Fecha**: 2026-02-16  
**Estado**: 🟢 TODO LISTO, COMENZAR AHORA  
**Responsable**: Tu equipo  
**Timeline**: 6 semanas a v0.1.0 BETA  

---

## 🚀 INICIO INMEDIATO (HOY)

### Task 1: Ejecutar Test Suite (BLOCKING)
**Tiempo**: 5 minutos  
**Importancia**: 🔴 CRÍTICO

```bash
cd server

# Ejecutar tests multi-tenant
npm test -- multi-tenant.spec.js

# Resultado esperado:
# PASS  src/__tests__/multi-tenant.spec.js
#   ✓ Employees cannot see other company data
#   ✓ Controllers validate companyId
#   ... (12 tests total)
# 
# Test Suites: 1 passed, 1 total
# Tests:       12 passed, 12 total
```

**Si FALLA**: 
```bash
# Debuggear qué salió mal
npm test -- multi-tenant.spec.js --verbose

# Problemas comunes:
# 1. MongoDB connection failed → revisar .env MONGODB_URI
# 2. Missing companyId validation → revisar controllers
# 3. Service not filtering by companyId → revisar services
```

**Si PASA**: ✅ Continua al siguiente step.

---

### Task 2: Implementar Rate Limiting (ASAP)
**Tiempo**: 1-2 horas  
**Importancia**: 🔴 CRÍTICO (Security)  
**Blocker**: Necesario antes de cualquier trabajo en v0.0.7

#### Step 2.1: Instalar paquete

```bash
cd server
npm install express-rate-limit
```

#### Step 2.2: Crear archivo

Crear `server/src/middleware/rateLimiter.js`:

```javascript
import rateLimit from "express-rate-limit"

// General limiter: 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Demasiadas solicitudes. Intenta más tarde.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Opcional: skip para admin IPs
    return false
  }
})

// Auth limiter: 10 login attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Demasiados intentos de login. Intenta en 15 minutos.",
  skipSuccessfulRequests: true  // No contar intentos exitosos
})

// Register limiter: 5 registros por hora
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Demasiados registros. Intenta en 1 hora."
})

// API limiter: 1000 requests per hour (loose)
export const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  message: "Rate limit exceeded"
})

export default {
  generalLimiter,
  authLimiter,
  registerLimiter,
  apiLimiter
}
```

#### Step 2.3: Aplicar en rutas

Actualizar `server/src/app.js`:

```javascript
import {
  generalLimiter,
  authLimiter,
  registerLimiter,
  apiLimiter
} from "./middleware/rateLimiter.js"

// Aplicar a toda la app
app.use("/api/", apiLimiter)

// Aplicar a rutas específicas
app.post("/api/auth/login", authLimiter, authController.login)
app.post("/api/auth/register", registerLimiter, authController.register)
```

#### Step 2.4: Testing

```bash
# Hacer 11 login attempts en 15 minutos
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# El 11º request debe retornar 429 Too Many Requests
# con mensaje: "Demasiados intentos de login..."
```

#### Step 2.5: Verificar

```bash
npm test -- rateLimiter.spec.js
# Debe pasar si existe el test

# O manualmente en dev:
npm run dev
# Hacer peticiones desde Postman/Thunder Client
# Ver que después de N requests rechaza
```

**DONE**: ✅ Rate limiting activo

---

### Task 3: Verificar Estructura de Directorios

```bash
# Confirmar que existen estas carpetas
ls -la server/src/

# Debe tener:
# api/
#   controllers/
#   routes/
# middleware/
# models/
# services/
# utils/

# Si FALTA algo, créalo:
mkdir -p server/src/tests
```

---

## 📋 PRÓXIMA SEMANA (v0.0.6 Prep)

### Task 4: Preparar Refresh Token Mechanism
**Tiempo**: 2-3 horas  
**Importancia**: 🟠 MEDIA (Necesario para v0.0.7)

**NO IMPLEMENTAR AÚN**, solo preparar estructura:

1. Crear `server/src/models/RefreshToken.js`:
   ```javascript
   const refreshTokenSchema = new mongoose.Schema({
     token: String,
     userId: Schema.Types.ObjectId,
     expiresAt: Date,
     createdAt: { type: Date, default: Date.now }
   })
   ```

2. Crear `server/src/middleware/handleTokenExpiry.js`:
   ```javascript
   // Middleware para detectar token expirado
   // Y sugerir refresh automático
   ```

3. Actualizar `client/src/services/apiClient.js`:
   ```javascript
   // Interceptor para auto-refresh en 401
   ```

**Timeline**: Implementar en v0.0.6 (Week 2)

---

## 🔧 SEMANA 2-3: v0.0.7 Labor Distribution

### Task 5: Crear Backend (Labor Distribution)

**Archivos a crear**:

1. `server/src/models/DistributionRule.js` (50 líneas)
2. `server/src/services/labor-distribution.service.js` (400 líneas)
3. `server/src/api/controllers/labor-distribution.controller.js` (60 líneas)
4. `server/src/api/routes/labor-distribution.routes.js` (20 líneas)

**Guía completa en**: `v0.0.7_LABOR_DISTRIBUTION.md` (distribuida a continuación)

**Checklist**:
- [ ] Models compilar sin errores
- [ ] Service tiene 4+ algoritmos de distribución
- [ ] Controllers tienen endpoints (distribute, my-share, rules)
- [ ] Routes registradas en app.js
- [ ] MongoDB indexes creados
- [ ] Tests escriben con 100% cobertura

**Tests a pasar**:
```bash
npm test -- labor-distribution.spec.js

# Esperado:
# ✓ Proportional salary distribution
# ✓ Equal fixed distribution
# ✓ Mixed fixed + variable
# ✓ Cannot distribute locked period
# ✓ All employees covered
# ✓ Distribution sum = surplus
```

### Task 6: Crear Frontend (Labor Distribution)

**Archivos a crear**:

1. `client/src/pages/Labor/LaborDistributionViewer.tsx` (100 líneas)
   - Vista admin: tabla de distribución
   
2. `client/src/pages/Labor/EmployeeShare.tsx` (80 líneas)
   - Vista empleado: su cuota + desglose
   
3. `client/src/services/laborDistribution.service.ts` (50 líneas)
   - API client

**Checklist**:
- [ ] Componentes compilan sin errores TS
- [ ] Llamadas API funcionan (si backend está en dev)
- [ ] UI muestra datos correctamente
- [ ] Responsive design mobile-friendly
- [ ] Accesibilidad: labels, aria-*

---

## 🔐 SEMANA 4-5: v0.0.8 Certification Layer

### Task 7: Crear Backend (Certification)

**Archivos a crear**:

1. `server/src/models/Certificate.js` (100 líneas)
2. `server/src/models/ComplianceAudit.js` (70 líneas)
3. `server/src/services/certification.service.js` (450 líneas)  ← COMPLEJO
4. `server/src/api/controllers/certification.controller.js` (80 líneas)
5. `server/src/api/routes/certification.routes.js` (25 líneas)

**Guía completa en**: `v0.0.8_CERTIFICATION_LAYER.md` (distribuida a continuación)

**Tests a pasar**:
```bash
npm test -- certification.spec.js

# Esperado:
# ✓ Pre-certification audit validates period
# ✓ Cannot certify with failed audit
# ✓ SHA256 hash works correctly
# ✓ Certificate number generated uniquely
# ✓ Period locked after certification
# ✓ Verification detects tampering
# ✓ Locked period rejects modifications
```

### Task 8: Crear Frontend (Certification)

**Archivos a crear**:

1. `client/src/components/CertificationModal.tsx` (150 líneas)
   - Modal de confirmación before certification
   
2. `client/src/pages/Certifications/CertificateVerificationPanel.tsx` (100 líneas)
   - Verificar integridad de certificado

**Checklist**:
- [ ] Modal pide confirmación explícita
- [ ] Audit results mostrados antes
- [ ] Cannot close without confirming
- [ ] Success state muestra certificate number
- [ ] Verification panel accesible públicamente

---

## ✅ SEMANA 6: INTEGRATION + TESTING

### Task 9: End-to-End Testing

```bash
# Escenario 1: Crear período, distribuir, certificar
# Step 1: Create period May 2026
POST /api/periods
Body: {month: 5, year: 2026}

# Step 2: Calculate result
POST /api/calculation/calculate-period/period-id
Body: {/* relevant data */}

# Step 3: Distribute surplus
POST /api/labor/distribute/period-id

# Step 4: Run audit
GET /api/certifications/audit/period-id
# Should return: {passed: true, tests: [...]}

# Step 5: Certify
POST /api/certifications/certify/period-id
# Should return: {certificate: {...}, period: {...}}

# Step 6: Verify
GET /api/certifications/verify/period-id
# Should return: {valid: true, integrity: "VALID"}

# Step 7: Try to modify (should fail)
PATCH /api/periods/period-id
Body: {sales: {...}}
# Should return: 403 Forbidden "Period is locked"
```

### Task 10: Load Testing

```bash
# Usando Apache Bench o k6
# Scenario: 1000 employees, simultaneously request my-share

ab -n 1000 -c 10 \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/labor/my-share/period-id

# Esperado:
# Requests per second: > 100
# Failed requests: 0
# Response time avg: < 300ms
```

### Task 11: Security Audit

```bash
# Checklist:
- [ ] No SQL injection
- [ ] No XXS en frontend
- [ ] No CSRF (si aplica)
- [ ] JWT validation strict
- [ ] Rate limiting activo
- [ ] Error messages no revelan Sistema
- [ ] Sensitive data no en logs
- [ ] companyId isolation verified
```

---

## 📊 TRACKING & MILESTONES

### Week 1
- [ ] Test suite passing (Task 1)
- [ ] Rate limiting implemented (Task 2)
- [ ] Structure ready (Task 3)

### Week 2-3
- [ ] v0.0.7 backend complete + tested (Task 5)
- [ ] v0.0.7 frontend complete + tested (Task 6)
- [ ] v0.0.6 refresh tokens prepared (Task 4)

### Week 4-5
- [ ] v0.0.8 backend complete + tested (Task 7)
- [ ] v0.0.8 frontend complete + tested (Task 8)

### Week 6
- [ ] E2E tests passing (Task 9)
- [ ] Load tests passing (Task 10)
- [ ] Security audit clean (Task 11)
- [ ] **READY FOR v0.1.0 BETA**

---

## 🔗 DOCUMENTOS REFERENCIA

Leer en este orden:

1. **Este documento** (next-actions.md) ← Estás aquí
2. **v0.0.7_LABOR_DISTRIBUTION.md** ← Specs completas para Task 5-6
3. **v0.0.8_CERTIFICATION_LAYER.md** ← Specs completas para Task 7-8
4. **v0.0.7_v0.0.8_INTEGRATION_GUIDE.md** ← Cómo todo se conecta
5. **RISK_ANALYSIS_AND_FAILURES.md** ← Problemas a evitar

---

## ❓ COMMON QUESTIONS

**¿Cuánto tiempo toma todo?**  
6 semanas trabajando full-time con 1-2 desarrolladores.

**¿Puedo empezar v0.0.7 antes de terminar v0.0.6 refresh tokens?**  
NO. Necesitas transacciones DB para v0.0.7. Hacer v0.0.6 primero.

**¿Qué pasa si rate limiting "rompe" mi app?**  
Ajusta los límites en rateLimiter.js:
```javascript
max: 100  // Era 100, cambia a 500 si necesitas más
```

**¿SHA256 hash es seguro?**  
Sí. Used by: Bitcoin, SSL/TLS, NIST approved. 0 colisiones conocidas en 30+ años.

**¿Cuándo hago deploy a producción?**  
NO hagas deploy hasta:
- [ ] Tests: 100% passing
- [ ] Rate limiting: activo
- [ ] SSL/HTTPS: configurado
- [ ] Secrets: no en .env ni git
- [ ] Backups: tested
- [ ] Monitoring: alerts setup

---

## 🎯 ÉXITO CRITERIA

Tu implementación es exitosa cuando:

1. ✅ Multi-tenant test suite: 12/12 passing
2. ✅ Rate limiting rechaza requests excesivos
3. ✅ Empleados ven distribución transparente
4. ✅ Admin puede certificar períodos
5. ✅ Verificación detecta tampering
6. ✅ Períodos certificados son inmutables
7. ✅ Load test: 1000 requests/sec
8. ✅ Security audit: 0 critical issues
9. ✅ Documentation 100% complete
10. ✅ Ready for Beta launch

---

**Status**: 🟢 READY TO START NOW  
**First Step**: Run `npm test -- multi-tenant.spec.js`  
**Questions?**: Refer to detailed specs in linked documents  
**Timeline**: 6 weeks to v0.1.0 BETA 🚀
