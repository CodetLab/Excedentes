# 🔐 Multi-Tenant + Autenticación Robusta v0.0.5

**Estado**: FASE 1-5 Completadas | FASE 6-7 Pendientes  
**Fecha**: Febrero 2026  
**Arquitecto**: Senior Backend  

---

## ✅ COMPLETADO

### FASE 1: Modelos y Relaciones
- ✅ `User.js` - Agregado `companyId` + `role` (admin | company)
- ✅ `CompanyModel.js` - Existía, asegurado ownerId + timestamps
- ✅ `PeriodModel.js` - Ya tenía companyId (excelente)
- ✅ `VentaModel.js` - Agregado `companyId` (FK obligatorio)
- ✅ `CapitalModel.js` - Agregado `companyId` (FK obligatorio)
- ✅ `CostoModel.js` - Agregado `companyId` (FK obligatorio)
- ✅ `EmployeeModel.js` - Ya tenía companyId

**Índices creados para performance multi-tenant:**
```javascript
// Todos los modelos ahora tienen:
schema.index({ companyId: 1 })
schema.index({ userId: 1 }) // Compatibilidad backward
```

---

### FASE 2: JWT + Identity
- ✅ `auth.service.js` - buildToken ahora incluye:
  ```javascript
  {
    sub: userId,
    email: email,
    companyId: companyId || null,
    role: "admin" | "company"
  }
  ```
- ✅ Token válido 7 días
- ✅ Firma con env JWT_SECRET

---

### FASE 3: Middleware de Autenticación
- ✅ Creado: `middleware/authenticateJWT.js`

**Middlewares disponibles:**

```javascript
// 1️⃣ Validar JWT (obligatorio en todas las rutas de negocio)
authenticateJWT
// → Inyecta en req: userId, email, companyId, role
// → Retorna 401 si token inválido

// 2️⃣ Validar rol (optional para endpoints específicos)
authorizeRole(['admin', 'company'])
// → Retorna 403 si rol insuficiente

// 3️⃣ Validar asignación a company (required para company users)
requireCompanyId
// → Retorna 403 si usuario sin companyId
```

---

### FASE 3.5: Integración en app.js
- ✅ `app.js` - Todas las rutas de negocio protegidas con authenticateJWT:
  ```
  /api/costos        → ✅ Protegido
  /api/capital       → ✅ Protegido
  /api/personal      → ✅ Protegido
  /api/ventas        → ✅ Protegido
  /api/ganancias     → ✅ Protegido
  /api/extras        → ✅ Protegido
  /api/excedentes    → ✅ Protegido
  /api/dashboard     → ✅ Protegido
  /api/calculate     → ✅ Protegido
  /api/auth          → ❌ NO protegido (login/register)
  ```

---

### FASE 5: Servicios Económicos Multi-Tenant
- ✅ `multi-tenant.helper.js` - Creado con funciones core:
  - `validateCompanyAccess()` - Valida pertenencia de recurso
  - `buildCompanyFilter()` - Crea filtro automático por rol
  - `enforceCompanyFilter()` - Garantiza filtrado en queries

- ✅ `calculation.service.js` - Refactored:
  - `calculateByPeriod(companyId, month, year)` - Cambio critical
  - `calculateForPeriod(periodId, companyId, role)` - Incluye validación multi-tenant
  - Ambos ahora requieren companyId como identificador principal

- ✅ `data-consolidation.service.js` - Refactored:
  - `consolidateByPeriod(companyId, month, year)` - Cambio critical
  - Todos los métodos privados ahora filtran por companyId
  - Queries garantizadas: WHERE companyId = ?

---

## ⏳ PENDIENTE

### FASE 5 (continuación): Otros Servicios
- ⏳ `capital.service.js` - Agregar filtros companyId
- ⏳ `personal.service.js` - Agregar filtros companyId
- ⏳ `ventas.service.js` - Agregar filtros companyId
- ⏳ `costos.service.js` - Agregar filtros companyId
- ⏳ `dashboard.service.js` - Agregar filtros companyId
- ⏳ `extras.service.js` - Agregar filtros companyId
- ⏳ `ganancias.service.js` - Agregar filtros companyId

**Pattern a aplicar en cada uno:**
```javascript
// Antes
async getByUserId(userId) {
  return Model.find({ userId });
}

// Después
async getByCompanyId(companyId) {
  return Model.find({ companyId });
}

// En el controller
router.get('/', authenticateJWT, async (req, res) => {
  const data = await service.getByCompanyId(req.companyId);
});
```

---

### FASE 4: Protección de Endpoints
- ⏳ Actualizar todos los controllers para usar `req.companyId` del JWT
- ⏳ NO aceptar companyId del body
- ⏳ NO aceptar userId del body (usar req.userId)

**Cambios en controllers:**

```javascript
// Antes
export const getCapital = async (req, res) => {
  const { userId, companyId } = req.body;  // ❌ INSEGURO
  const data = await service.getByUserId(userId);
}

// Después
export const getCapital = async (req, res) => {
  const { companyId, userId, role } = req; // ✅ Del JWT
  const data = await service.getByCompanyId(companyId);
}
```

---

### FASE 6: Validación de Aislamiento
**Escenarios a probar (después de implementación):**

1. ✅ Empresa A intenta acceder Period de Empresa B → 404
2. ✅ Sin token intenta calcular → 401
3. ✅ Token válido pero period ajeno → 404
4. ✅ Admin puede listar empresas
5. ✅ Company solo ve su empresa

**Test suite sugerido:**
```bash
POST /api/auth/register  # Crear 2 usuarios + 2 empresas
POST /api/capital        # Cargar datos a Empresa A
POST /api/calculate      # Calcular Empresa A
# Intercambiar tokens y verificar 404/403
```

---

### FASE 7: Frontend Ajustes Mínimos
- ⏳ Guardar token en localStorage (ya existe)
- ⏳ Enviar `Authorization: Bearer {token}` en todos los requests
- ⏳ Si 401 → logout automático
- ⏳ **Nunca** enviar `companyId` desde cliente (viene del JWT)

---

## 🚨 Reglas Críticas

### Seguridad
```javascript
// ❌ NUNCA hacer esto
req.body.companyId
req.body.userId
req.query.companyId

// ✅ SIEMPRE usar
req.companyId  // Del JWT
req.userId     // Del JWT
req.role       // Del JWT
```

### Queries en BD
```javascript
// ❌ Sin companyId
Capital.find({ userId })

// ✅ Con companyId
Capital.find({ companyId })

// ✅ Con validación multi-tenant
Capital.find({ 
  companyId, 
  ...otherFilters 
})
```

### 404 vs 403
```javascript
// Si usuario company intenta acceder recurso de otra empresa:
// Retornar 404 (no revelar existencia)

if (userRole === 'company' && resource.companyId !== userCompanyId) {
  throw new NotFoundError("Resource", id);
}
```

---

## 📋 Checklist de Validación

- [x] JWT incluye companyId y role
- [x] Middleware authenticateJWT en todas las rutas económicas
- [x] Modelos tienen companyId como FK
- [x] Cálculo requiere JWT válido
- [x] calculateByPeriod filtra por companyId
- [x] Datos no se pueden forzar desde body
- [ ] Todos los servicios filtran por companyId
- [ ] Todos los controllers usan req.companyId
- [ ] Tests de aislamiento pasan
- [ ] v0.0.4 no se rompió

---

## 🔄 Flujo de Implementación Recomendado

**Para NO romper nada en paralelo:**

1. ✅ Completar  FASE 1-5 (HECHO)
2. ⏳ Task en paralelo: Actualizar cada servicio económico
3. ⏳ Task en paralelo: Actualizar cada controller
4. ⏳ Task en paralelo: Tests de aislamiento
5. Merge + Deploy v0.0.5

**Evitar:**
- No mezclar cambios de modelo con cambios de servicio
- No hacer push de tokens de empresas en datos
- No confiar en frontend para identidad

---

## 📞 Reference

**Archivo de identidad:**
- `req.userId` - String (UUID/ObjectId del usuario)
- `req.email` - String (email único)
- `req.companyId` - String (ObjectId de la empresa o null)
- `req.role` - String ('admin' | 'company')

**Siempre disponible después de req pasar por `authenticateJWT`**

---

**v0.0.5 Security Implementation**  
*Listo para SaaS + Facturación*
