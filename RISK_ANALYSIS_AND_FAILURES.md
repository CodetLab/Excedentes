# 🚨 Análisis de Riesgos y Fallos Potenciales - v0.0.5 → v0.0.8

**Status**: Critical Analysis  
**Fecha**: 2026-02-16  
**Versión**: v0.0.5 Multi-Tenant  

---

## 🔴 FALLOS CRÍTICOS ACTUALES (Producción-Ready Issues)

### 1️⃣ **JWT Token Storage - SEGURIDAD CRÍTICA**

**Problema:**
```javascript
localStorage["excedentes_auth"] // JSON con token en PLAINTEXT
```

**Riesgos:**
- 🔴 XSS attacks pueden robar todo el localStorage
- 🔴 Token visible en DevTools (desarrollo = mismo riesgo)
- 🔴 LocalStorage sincronizado entre tabs = lateral movement risk
- 🔴 Múltiples logins sin logout previo crean tokens huérfanos

**Impacto**: **CRÍTICO** - Data de múltiples empresas expuesta

**Solución (v0.1+):**
```javascript
// ❌ Actual
localStorage.setItem("excedentes_auth", JSON.stringify({token, user, companyId, role}))

// ✅ Mejor: Usar HttpOnly cookies + CSRF token
// Backend:
res.cookie("auth_token", token, {
  httpOnly: true,       // JS no puede acceder
  secure: true,         // HTTPS only
  sameSite: "strict",   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
})

// Frontend: No accedes al token, axios lo envía automáticamente
```

**Severidad**: 🔴 HIGH - Mitigation: Usar HTTPS + CSP headers

---

### 2️⃣ **No Hay Refresh Token Mechanism**

**Problema:**
```javascript
// Token expira en 7 días - ¿qué pasa después?
// Usuario no puede refrescarlo sin re-login
```

**Riesgos:**
- 🔴 User experience: Logout forzado cada 7 días
- 🔴 Session loss durante cálculos largos
- 🔴 No hay "keep alive" mechanism
- 🔴 Imposible implementar logout global

**Impacto**: **CRÍTICO** en producción

**Solución (v0.1+):**
```javascript
// Backend: Implementar refresh token separado
POST /api/auth/refresh
{
  refreshToken: "..."  // Duración: 30 días
}
→ { token: "...", refreshToken: "..." }

// Frontend: Interceptor que automáticamente refreshea
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response.status === 401) {
      const newToken = await refreshToken();
      // Retry original request
    }
  }
)
```

**Severidad**: 🔴 CRITICAL - Mitigation: Logout en 7 días hasta v0.1

---

### 3️⃣ **No Hay Rate Limiting**

**Problema:**
```
API endpoints sin protección contra brute force
```

**Riesgos:**
- 🔴 Credential stuffing: 10,000s requests/min sin límite
- 🔴 Password reset abuse: Enviar emails infinitos
- 🔴 Calculation abuse: Ejecutar cálculo 1000x/segundo
- 🔴 Database DOS: Queries sin límites

**Impacto**: **CRÍTICO** - Sistema caerá bajo ataque

**Solución (v0.1):**
```javascript
// Usar express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutos
  max: 100,                      // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Endpoints críticos con límites más estrictos
app.post('/api/auth/login', strictLimiter, loginHandler)  // 5/min
app.post('/api/auth/register', strictLimiter, registerHandler)  // 3/min
```

**Severidad**: 🔴 CRITICAL - Mitigation: Add antes de producción

---

### 4️⃣ **No Hay Validación de Integridad Económica en Cálculo**

**Problema:**
```javascript
// Backend calcula pero ¿y si los datos cambian entre validación y cálculo?
// Race condition: Venta se elimina después de validar pero antes de calcular
```

**Riesgos:**
- 🟠 Venta eliminada entre validación y cálculo → cálculo incompleto
- 🟠 Employee modificado durante consolidación → datos inconsistentes
- 🟠 Period bloqueado pero datos pueden cambiar (sin transaction)
- 🟠 Multi-tenant leakage: Datos de empresa X en cálculo de empresa Y

**Impacto**: **ALTO** - Resultados económicos inválidos

**Solución (v0.0.7+):**
```javascript
// Usar transactions en MongoDB
const session = await mongoose.startSession()
session.startTransaction()

try {
  // 1. Lock el período
  const period = await Period.findOneAndUpdate(
    { _id: periodId, companyId, status: "open" },
    { $set: { status: "calculating" } },
    { session, new: true }
  )
  if (!period) throw new LockError()
  
  // 2. Snapshot de datos
  const snapshot = await createSnapshot(periodId, session)
  
  // 3. Calcular
  const result = await calculate(snapshot, session)
  
  // 4. Guardar resultado
  await period.updateOne({ result }, { session })
  
  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
}
```

**Severidad**: 🟠 MEDIUM - Mitigation: Add locks antes de v0.0.7

---

### 5️⃣ **companyId No Validado Exhaustivamente**

**Problema:**
```javascript
// Backend valida req.companyId existe
// Pero ¿y si token tiene companyId de empresa que no existe en DB?
const companyId = req.companyId;  // Vino del JWT
const capital = await Capital.find({ companyId })  // ¿companyId válido?
```

**Riesgos:**
- 🟠 Companyid quemada en token pero empresa borrada
- 🟠 Empresa suspendida pero usuario sigue accediendo
- 🟠 User transferido a otra empresa pero old token sigue válido
- 🟠 Admin crea 2 empresas pero token siempre devuelve A

**Impacto**: **ALTO** - Acceso a datos después de revocar

**Solución (v0.0.6+):**
```javascript
// Validar companyId en cada request
export const validateCompanyAccess = asyncHandler(async (req, res, next) => {
  const companyId = req.companyId
  
  const company = await Company.findOne({
    _id: companyId,
    status: { $in: ["active", "trial"] }  // No suspendidas
  })
  
  if (!company) {
    return sendError(res, 403, "Company access revoked or deleted")
  }
  
  // Verificar usuario aún pertenece a esa empresa
  const user = await User.findOne({
    _id: req.userId,
    companyId: companyId
  })
  
  if (!user) {
    return sendError(res, 403, "User no longer belongs to this company")
  }
  
  next()
})

// Usar en todas las rutas
app.use('/api/data/*', validateCompanyAccess)
```

**Severidad**: 🟠 MEDIUM - Mitigation: Add antes de multi-user

---

### 6️⃣ **No Hay Manejo de Concurrencia**

**Problema:**
```
Usuario A y Usuario B (misma empresa) editan Period simultáneamente
Último write gana (destructivo)
```

**Riesgos:**
- 🟠 Ediciones simultáneas: B sobrescribe A
- 🟠 Cálculos paralelos: 2 threads con datos inconsistentes
- 🟠 Capital double-counting: Dos ventas con mismo ID
- 🟠 Dinero desaparece del cálculo

**Impacto**: **ALTO** - Fraude accidental posible

**Solución (v0.0.8+):**
```javascript
// Usar optimistic locking (versioning)
periodSchema.add({
  version: { type: Number, default: 0 }
})

// Al actualizar:
const updated = await Period.updateOne(
  { _id: periodId, companyId, version: currentVersion },
  { 
    $set: { data: newData },
    $inc: { version: 1 }
  }
)

if (!updated.matchedCount) {
  throw new ConflictError("Period was modified by another user")
}

// Cliente maneja retry
```

**Severidad**: 🟠 MEDIUM - Mitigation: En v0.0.8

---

### 7️⃣ **Errores No Causan Rollback de Cambios**

**Problema:**
```javascript
// Si cálculo falla a mitad, ¿datos persisten?
await Period.updateOne({ sales: newSales })  // OK
throw new Error("Costs calculation failed")    // OOPS
// sales cambió, pero costs no se calcularon!
```

**Riesgos:**
- 🟠 Datos inconsistentes en excepción
- 🟠 Período con sales pero sin costos
- 🟠 Validación de integridad fallida
- 🟠 Cálculo posterior usa datos sucios

**Impacto**: **ALTO** - Inconsistencia económica

**Solución (v0.0.6+):**
```javascript
// Usar transactions + wrapper
async function calculatePeriodSafely(periodId, companyId) {
  const session = await mongoose.startSession()
  session.startTransaction()
  
  try {
    const period = await Period.findOne({ _id: periodId, companyId }, {}, { session })
    
    const sales = await consolidateSalesData(period, session)
    await validateEconomicsInvariant(sales, session)
    
    const result = await economicEngine.calculate(sales)
    
    const saved = await Period.updateOne(
      { _id: periodId },
      { result, status: "calculated" },
      { session }
    )
    
    await session.commitTransaction()
    return result
  } catch (error) {
    await session.abortTransaction()  // ← Rollback automático
    throw new CalculationError(`Calculation failed safely: ${error.message}`)
  }
}
```

**Severidad**: 🟠 MEDIUM - Mitigation: Implementar antes de v0.0.7

---

## 🟠 RIESGOS DE DISEÑO FUTURO

### Risk 1: Labor Distribution (v0.0.7) - Inequidad Algorítmica

**Problema:**
```
Si algoritmo de distribución es incorrecto:
→ Algunos empleados ganan más de lo merecido
→ Otros pierden dinero
→ Sistema es injusto
```

**Severidad**: 🔴 CRITICAL para v0.0.7

**Mitigación:**
- [ ] Auditores externos verifican algoritmo
- [ ] Unit tests exhaustivos por regla
- [ ] Comparación con distribución manual
- [ ] Panel transparente mostrando cálculo
- [ ] Cada empleado puede disputar resultado
- [ ] Audit trail: quién cambió qué, cuándo

**Diseño en v0.0.7:**
```javascript
// LaborDistribution.service.js
async distribute(period, rule = "proportional-salary") {
  // Validaciones
  if (period.surplus < 0) throw new InvalidSurplusError()
  if (!period.employees.length) throw new NoEmployeesError()
  
  // Por cada regla, guardar decisión de distribución
  const distribution = {}
  
  // Regla 1: Proporcional a Salario
  if (rule === "proportional-salary") {
    const totalSalary = period.employees.reduce((sum, e) => sum + e.salary, 0)
    period.employees.forEach(emp => {
      distribution[emp.id] = (emp.salary / totalSalary) * period.surplus
    })
  }
  
  // Guardar en Period.distribution con versionamiento
  await Period.updateOne(
    { _id: period._id },
    {
      distribution,
      distributionRule: rule,
      distributionVersion: "v1",  // Trazabilidad
      auditLog: {
        changedAt: new Date(),
        changedBy: req.userId,
        rule: rule,
        hash: sha256(JSON.stringify(distribution))
      }
    }
  )
}
```

---

### Risk 2: Certification (v0.0.8) - Incapacidad de Revisar

**Problema:**
```
Certificate se genera pero nadie puede verificar su validez
Sin prueba criptográfica: ¿es real o fake?
```

**Severidad**: 🔴 CRITICAL para v0.0.8

**Mitigación:**
- [ ] SHA256 hash of inputs + outputs
- [ ] Timestamp notarizado en servidor
- [ ] Imposible modificar inputs post-certificación
- [ ] Verificación: recalcular hash = match?
- [ ] Blockchain integration (opcional v0.9)

**Diseño en v0.0.8:**
```javascript
// CertificationService
async certificatePeriod(periodId, companyId) {
  const period = await Period.findOne({ _id: periodId, companyId })
  
  if (period.certified) {
    throw new AlreadyCertifiedError()
  }
  
  // 1. Snapshot de inputs
  const inputSnapshot = {
    sales: period.sales,
    costs: period.costs,
    employees: period.employees,
    timestamp: new Date().toISOString()
  }
  
  // 2. Snapshot de outputs
  const outputSnapshot = {
    result: period.result,
    distribution: period.distribution,
    timestamp: new Date().toISOString()
  }
  
  // 3. Crear hash de ambos
  const inputHash = sha256(JSON.stringify(inputSnapshot))
  const outputHash = sha256(JSON.stringify(outputSnapshot))
  
  // 4. Crear certificado
  const certificate = {
    periodId,
    companyId,
    inputHash,
    outputHash,
    certifiedAt: new Date(),
    certifier: "EXCEDENTES_ENGINE_v1",
    signedBy: req.userId,
    verificationUrl: `/api/verify/${periodId}`
  }
  
  // 5. Persistir y lock período
  await Promise.all([
    // Guardar certificado
    Certificate.create(certificate),
    
    // Lock período: no se pueden cambiar inputs
    Period.updateOne(
      { _id: periodId },
      { 
        certified: true,
        certificateId: certificate._id,
        locked: true,  // ← No se permite editar
        status: "certified"
      }
    )
  ])
  
  return certificate
}

// Verificación
async verifyCertificate(periodId) {
  const period = await Period.findOne({ _id: periodId })
  const cert = await Certificate.findOne({ periodId })
  
  if (!cert) throw new NotCertifiedError()
  
  // Recalcular hash
  const currentInputHash = sha256(JSON.stringify(period.inputs))
  const currentOutputHash = sha256(JSON.stringify(period.outputs))
  
  return {
    valid: currentInputHash === cert.inputHash && 
           currentOutputHash === cert.outputHash,
    hash: {
      input: { stored: cert.inputHash, current: currentInputHash },
      output: { stored: cert.outputHash, current: currentOutputHash }
    },
    tamperedAt: currentInputHash !== cert.inputHash ? new Date() : null
  }
}
```

**Severidad**: 🔴 CRITICAL - Implementación requerida

---

### Risk 3: Escala - Performance Degradation

**Problema:**
```
Con 1,000 empresas:
- Queries sin índices: 10+ segundos
- Consolidación de datos: Memory leak
- Cálculo = timeout
```

**Severidad**: 🟠 MEDIUM para v0.0.7

**Solución:**
```javascript
// ANTES: N+1 query
const companies = await Company.find()
companies.forEach(async (c) => {
  const periods = await Period.find({ companyId: c._id })
  // ... 1000 requests! 10+ segundos
})

// DESPUÉS: Aggregation pipeline
const result = await Period.aggregate([
  {
    $match: {
      status: "open",
      createdAt: { $gte: month }
    }
  },
  {
    $lookup: {
      from: "companies",
      localField: "companyId",
      foreignField: "_id",
      as: "company"
    }
  },
  {
    $group: {
      _id: "$companyId",
      totalSales: { $sum: "$result.totalRevenue" },
      count: { $sum: 1 }
    }
  }
])
// ← Single query, < 100ms, even with 1M docs
```

**Severidad**: 🟠 MEDIUM - Implementar antes de scale

---

## 🟡 PROBLEMAS DE TESTING

### Problem 1: Não há test de multi-tenant isolation

**Actual:**
```
Tests creados: ✅ multi-tenant.spec.js
Tests ejecutados: ❌ Nunca
Tests pasando: ❓ Desconocido
```

**Riesgo**: Isolation podría estar rota sin saberlo

**Solución:**
```bash
# Ejecutar tests
cd server
npm test -- multi-tenant.spec.js

# Resultado debe ser: 12/12 passing
```

**Severidad**: 🟠 MEDIUM - Blocker para producción

---

### Problem 2: No hay integration tests

**Actual:**
```
Unit tests: Algunos
Integration tests: 0
Backend-Frontend sync: Manual
```

**Riesgo**: Cambios en backend rompen frontend silenciosamente

**Solución (v0.0.8):**
```javascript
// tests/integration/labor-distribution.test.js
describe("Labor Distribution v0.0.7", () => {
  it("should distribute surplus proportionally by salary", async () => {
    const company = await createTestCompany()
    const period = await createTestPeriod(company, {
      surplus: 1000,
      employees: [
        { id: 1, salary: 1000 },  // 50% → $500
        { id: 2, salary: 1000 }   // 50% → $500
      ]
    })
    
    const dist = await laborService.distribute(period, "proportional-salary")
    
    expect(dist[1]).toBe(500)
    expect(dist[2]).toBe(500)
    expect(sum(Object.values(dist))).toBe(1000)  // Conserva surplus
  })
})
```

**Severidad**: 🟡 LOW - Pero recomendado

---

## ✅ MITIGACIONES INMEDIATAS (Pre v0.1)

| Risk | Mitigation | Timeline |
|------|-----------|----------|
| JWT in localStorage | Add HTTPS + CSP headers | ASAP |
| No refresh token | Logout en 7 días (documenta) | v0.0.6 |
| No rate limiting | Add express-rate-limit | ASAP |
| Race conditions | Add transactions | v0.0.7 |
| Certification invalid | Add SHA256 hashing | v0.0.8 |
| Performance | Add aggregation indices | v0.0.7 |
| Multi-tenant tests | npm test | v0.0.6 |

---

## 📊 Risk Matrix

```
           LIKELIHOOD
         Low  Medium  High
   ┌──────┬──────┬──────┐
H  │      │ JWT  │ Rate │
I  │      │ Sec  │ Limit│
G  ├──────┼──────┼──────┤
H  │Conc  │Cert  │Race │
   │urency│ Crypt│Cond │
   ├──────┼──────┼──────┤
M  │ Test │Refr  │Monit│
   │ Cover│Token │oring│
   └──────┴──────┴──────┘

🔴 = Critical Path
🟠 = Blocking Features
🟡 = Nice to Have
```

---

**Status:** 🟡 Action Required  
**Priority**: JWT Security + Rate Limiting (ASAP)  
**Next**: Implement mitigations before v0.0.6
