# 🔄 Tareas en Paralelo - Multi-Tenant v0.0.5

**Estado**: Listo para paralelización  
**Pauta**: Cada tarea es independiente, puede hacerse en ANY orden  
**Coordinación**: Cambios incrementales, sin bloqueos  

---

## TASK 1: Actualizar capital.service.js

**Responsabilidad:** Refactorizar `capital.service.js` para filtrar por `companyId`

**Archivo**: `server/src/services/capital.service.js`

**Cambios requeridos**:

1. Sustituir todos los `userId` por `companyId` en los métodos públicos
2. Patrón: `method(userId,...)` → `method(companyId,...)`
3. En queries: `{ userId }` → `{ companyId }`

**Métodos a actualizar:**
```javascript
// Antes
async getCapitalByUser(userId) { return Capital.find({ userId }); }
async getCapitalByType(userId, tipo) { return Capital.find({ userId, tipo }); }

// Después
async getCapitalByCompany(companyId) { return Capital.find({ companyId }); }
async getCapitalByType(companyId, tipo) { return Capital.find({ companyId, tipo }); }
```

**En el controller (`api/controllers/capital.controller.js`):**
```javascript
// Antes
const capital = await service.getCapitalByUser(req.body.userId);

// Después
const capital = await service.getCapitalByCompany(req.companyId);
```

**Validación:**
- [ ] Todos los métodos usan `companyId`
- [ ] Controllers pasan `req.companyId` al servicio
- [ ] No hay referencias a `userId` en queries
- [ ] Backward compatibility si es necesario (mantener deprecated methods?)

---

## TASK 2: Actualizar personal.service.js

**Responsabilidad:** Similar a TASK 1, pero para personal

**Archivo**: `server/src/services/personal.service.js`

**Cambios requeridos:**
1. `userId` → `companyId` en todas las queries
2. Obtener empleados (Employee tiene companyId ✅)
3. Filtrar personal items (Capital con tipo PERSONAL_*)

**Métodos críticos:**
```javascript
// Obtener empleados de una empresa
async getEmployeesByCompany(companyId) {
  return Employee.find({ companyId });
}

// Sumarizar costos por empresa
async getSalaryTotalsByCompany(companyId) {
  const employees = await Employee.find({ companyId });
  return employees.reduce((sum, e) => sum + e.baseSalary, 0);
}
```

**En controller:**
```javascript
export const getPersonalData = async (req, res) => {
  const companyId = req.companyId;  // Del JWT
  const data = await service.getByCompany(companyId);
  res.json(data);
};
```

**Validación:**
- [ ] Employee queries filtran por `companyId`
- [ ] Personal capital items filtran por `companyId`
- [ ] Controllers usan `req.companyId`

---

## TASK 3: Actualizar ventas.service.js

**Responsabilidad:** Refactorizar para Venta con `companyId`

**Archivo**: `server/src/services/ventas.service.js`

**Cambios requeridos:**
1. Venta model ya tiene `companyId` ✅ (actualizado)
2. Cambiar queries de `userId` a `companyId`

**Métodos:**
```javascript
// Obtener ventas de una empresa por período
async getVentasByPeriod(companyId, month, year) {
  const periodo = `${month}/${year}`;
  return Venta.find({
    companyId,
    $or: [
      { periodo },
      { periodo: `${String(month).padStart(2, '0')}/${year}` }
    ]
  });
}

// Sumarizar ventas
async getTotalVentas(companyId, month, year) {
  const ventas = await this.getVentasByPeriod(companyId, month, year);
  return ventas.reduce((sum, v) => sum + v.montoUSD, 0);
}
```

**Validación:**
- [ ] Todas las queries usan `companyId`
- [ ] Controllers pasan `req.companyId`
- [ ] Período filtrado correctamente

---

## TASK 4: Actualizar costos.service.js

**Responsabilidad:** Refactorizar Costo para multi-tenant

**Archivo**: `server/src/services/costos.service.js`

**Cambios requeridos:**
1. Costo model ya tiene `companyId` ✅
2. Cambiar queries: `userId` → `companyId`

**Métodos:**
```javascript
// Obtener costos de una empresa
async getCostosByCompany(companyId) {
  return Costo.find({ companyId });
}

// Sumarizar por tipo
async getCostosByType(companyId, tipo) {
  return Costo.find({ companyId, tipo });
}

// Total de costos
async getTotalCostos(companyId, tipo = null) {
  const query = { companyId };
  if (tipo) query.tipo = tipo;
  const costos = await Costo.find(query);
  return costos.reduce((sum, c) => sum + c.monto, 0);
}
```

**Validación:**
- [ ] Queries usan `companyId`
- [ ] Controllers usan `req.companyId`

---

## TASK 5: Actualizar dashboard.service.js

**Responsabilidad:** Dashboard multi-tenant

**Archivo**: `server/src/services/dashboard.service.js`

**Cambios requeridos:**
1. Consolidar datos de una empresa (NO multi-empresa)
2. Usar `companyId` para filtrar todo

**Métodos:**
```javascript
// Resumen dashboard para una empresa
async getDashboardSummary(companyId) {
  const [
    capitalTotal,
    personalTotal,
    ventasTotal,
    costosTotal
  ] = await Promise.all([
    this._getTotalCapital(companyId),
    this._getTotalPersonal(companyId),
    this._getTotalVentas(companyId),
    this._getTotalCostos(companyId)
  ]);

  return {
    totalAssets: capitalTotal,
    totalPersonal: personalTotal,
    totalVentas: ventasTotal,
    totalCostos: costosTotal,
    companyId
  };
}

// Métodos privados
async _getTotalCapital(companyId) {
  const items = await Capital.find({ companyId });
  return items.reduce((sum, i) => sum + i.valorUSD, 0);
}

async _getTotalPersonal(companyId) {
  const employees = await Employee.find({ companyId });
  return employees.reduce((sum, e) => sum + e.baseSalary, 0);
}
```

**En controller:**
```javascript
export const getDashboard = async (req, res) => {
  const companyId = req.companyId;
  const data = await service.getDashboardSummary(companyId);
  res.json(data);
};
```

**Validación:**
- [ ] Todos los queries usan `companyId`
- [ ] Controller pasa `req.companyId`

---

## TASK 6: Actualizar capital.controller.js

**Responsabilidad:** Pasar `req.companyId` (NO from body)

**Archivo**: `server/src/api/controllers/capital.controller.js`

**Cambio patrón:**

```javascript
// ❌ ANTES
export const getCapital = async (req, res) => {
  const { userId, companyId } = req.body;
  const capital = await capitalService.getCapitalByUser(userId);
  res.json(capital);
};

// ✅ DESPUÉS
export const getCapital = async (req, res) => {
  const companyId = req.companyId;  // Del JWT
  
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: "Usuario no asignado a empresa",
      timestamp: new Date().toISOString()
    });
  }
  
  const capital = await capitalService.getCapitalByCompany(companyId);
  res.json({ success: true, data: capital, timestamp: new Date().toISOString() });
};
```

**Métodos a actualizar:**
- `getCapital` → usa `req.companyId`
- `getCapitalByType` → usa `req.companyId`
- `createCapital` → extrae `companyId` de `req`, asigna al capital item
- `updateCapital` → válida que el item pertenece a `req.companyId`
- `deleteCapital` → válida que el item pertenece a `req.companyId`

**Validación:**
- [ ] No hay `req.body.companyId`
- [ ] No hay `req.body.userId`
- [ ] Usa `req.companyId` en todos los casos
- [ ] Crea nuevos items CON `companyId` insertado

---

## TASK 7: Actualizar personal.controller.js

**Similar a TASK 6, pero para personal**

**Archivo**: `server/src/api/controllers/personal.controller.js`

**Cambios:**
1. `req.companyId` en lugar de `req.body.companyId`
2. Pasar a servicio como parámetro
3. Validar que items pertenecen a la company

---

## TASK 8: Actualizar ventas.controller.js

**Similar a TASK 6, pero para ventas**

**Archivo**: `server/src/api/controllers/ventas.controller.js`

**Cambios:**
1. `req.companyId` obligatorio
2. Nuevas ventas: insertarlas CON `companyId`

```javascript
export const createVenta = async (req, res) => {
  const { montoUSD, descripcion, periodo } = req.body;
  const companyId = req.companyId;
  
  const venta = await Venta.create({
    companyId,  // ✅ Forzado
    montoUSD,
    descripcion,
    periodo
  });
  
  res.status(201).json({ success: true, data: venta });
};
```

---

## TASK 9: Actualizar costos.controller.js

**Similar a TASK 6, pero para costos**

---

## TASK 10: Actualizar extras.controller.js

**Similar a TASK 6, pero para extras**

---

## TASK 11: Actualizar ganancias.controller.js

**Similar a TASK 6, pero para ganancias**

---

## TASK 12: Tests de Aislamiento Multi-Tenant

**Archivo sugerido**: `server/src/__tests__/multi-tenant.spec.js`

**Escenarios a probar:**

```javascript
describe("Multi-Tenant Isolation", () => {
  
  it("Empresa A NO puede acceder data de Empresa B", async () => {
    // 1. Crear 2 usuarios + 2 empresas
    const user1 = await register("user1@test.com", "pass123");
    const user2 = await register("user2@test.com", "pass123");
    
    // 2. Crear capital en empresa 1
    const capital1 = await createCapital(user1.token, {
      tipo: "TIERRAS",
      valor: 5000
    });
    
    // 3. Intentar acceder desde empresa 2
    const response = await getCapital(user2.token, capital1.id);
    
    // Debe retornar 404 (no revelar existencia)
    expect(response.status).toBe(404);
  });

  it("Sin token NO puede acceder endpoints económicos", async () => {
    const response = await getCapital(null);
    expect(response.status).toBe(401);
  });

  it("Admin PUEDE ver múltiples empresas", async () => {
    // Token con role: 'admin'
    const response = await listCompanies(adminToken);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(1);
  });

  it("Company solo ve su empresa", async () => {
    // Token con role: 'company' + companyId = ABC
    const response = await getCompanyData(companyToken);
    expect(response.data.companyId).toBe("ABC");
  });

  it("Cálculo requiere JWT válido", async () => {
    const response = await calculate(null, { month: 1, year: 2026 });
    expect(response.status).toBe(401);
  });

  it("Período ajeno retorna 404", async () => {
    // Crear período en empresa 1
    const period = await createPeriod(user1.token, {
      month: 1,
      year: 2026
    });
    
    // Intentar calcular desde empresa 2
    const response = await calculatePeriod(user2.token, period.id);
    expect(response.status).toBe(404);
  });

});
```

**Herramientas sugeridas:**
- Jest o Mocha + Chai
- Supertest para HTTP
- Database fixtures/seeds

**Validación:**
- [ ] Todos los escenarios pasan
- [ ] No hay fugas de datos entre empresas
- [ ] 401 en todos los endpoints sin JWT
- [ ] 3-4 empresas de prueba funcionan correctamente

---

## TASK 13: Migración de Datos Existentes (si aplica)

**Si hay datos en producción:**

```javascript
// Script de migración (usar con cuidado)
db.ventas.updateMany(
  { companyId: { $exists: false } },
  { $set: { companyId: SEED_COMPANY_ID } }
);

db.capitals.updateMany(
  { companyId: { $exists: false } },
  { $set: { companyId: SEED_COMPANY_ID } }
);

db.costos.updateMany(
  { companyId: { $exists: false } },
  { $set: { companyId: SEED_COMPANY_ID } }
);
```

**Validación:**
- [ ] Backup antes de ejecutar
- [ ] Verificar que SEED_COMPANY_ID existe
- [ ] Contar documentos antes/después

---

## 📝 Notas Importantes

**Para evitar conflictos en paralelo:**

1. **Cada TASK toca un archivo distinto** → No hay merge conflicts
2. **Pattern es consistente** → Copy-paste es seguro
3. **Cambios son aditivos, no destructivos** → Sin rollback
4. **Mantener backward compatibility** → userId field persiste pero deprecated

**Si dos agentes tocan el mismo archivo:**
- Prioridad: Controllers primero, luego servicios
- Coordinate via comments: `// TASK X: Done`

**Testeo:**
- Test cada cambio antes de enviar
- Si rompe algo: revert + log

---

## ✅ Definition of Done (por TASK)

- [ ] Todos los métodos usan `companyId` 
- [ ] Controllers pasan `req.companyId`
- [ ] Queries tienen `{ companyId }`
- [ ] No hay hardcoded userId/companyId
- [ ] Funciona con 2+ empresas
- [ ] No se rompió v0.0.4

---

**Listo para paralelización**  
**Coordinar via merge commits**  
**Ya! 🚀**
