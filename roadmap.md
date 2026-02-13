# 🧭 EXCEDENTES — Roadmap Técnico v0.0.3 → v1.0.0

Regla base:
Cada versión debe mejorar ejecución, claridad o escalabilidad.
Si no lo hace → no se lanza.

---

# 🟢 v0.0.3 — Persistence & API Surface (ACTUAL)

🎯 Objetivo  
Hacer que el Core determinista sea consumible externamente.

## Backend

- MongoDB configurado correctamente
- Modelos:
  - Company
  - Employee
  - Asset
  - Period
- Repositories desacoplados del motor
- Servicio `EconomicCalculationService`
- Endpoint:
  - `POST /calculate`
- Validación estricta de inputs (schema validation)
- Respuesta estructurada:
  - breakEven
  - totalRevenue
  - totalCost
  - surplus
  - distribution
  - auditTrail

## Criterio de cierre

- El mismo input produce siempre el mismo output
- El cálculo puede ejecutarse sin UI
- Test manual reproducible vía Postman/Insomnia

📦 Valor  
El motor ya es infraestructura utilizable.

---

# 🟡 v0.0.4 — Data Integrity & Economic Safety

🎯 Objetivo  
Blindar la consistencia económica.

## Incluye

- Validaciones económicas (no técnicas):
  - Costos negativos prohibidos
  - Revenue inválido bloqueado
  - Períodos duplicados prevenidos
- Middleware global de errores
- Logging estructurado
- Tests automáticos de API (jest)
- Normalización de respuestas de error

## Criterio de cierre

- No se puede romper el sistema con inputs absurdos
- Errores económicos claros y semánticos

📦 Valor  
Confianza matemática.

---

# 🟠 v0.0.5 — Auth & Multi-Tenant Isolation

🎯 Objetivo  
Separar empresas y asegurar datos.

## Incluye

- JWT auth
- Roles:
  - admin
  - company
- Protección de endpoints
- Relación Company → Periods
- Filtro automático por companyId

## Criterio de cierre

- Una empresa no puede ver datos de otra
- El cálculo requiere identidad válida

📦 Valor  
Sistema cerrable y comercializable.

---

# 🟡 v0.0.6 — Economic Visibility UI (Core Dashboard)

🎯 Objetivo  
Visualizar el cálculo económico.

## Frontend

- Setup React limpio
- Login
- Formulario de carga de datos económicos
- Llamado real a `/calculate`
- Dashboard con:

  - Punto de equilibrio
  - Excedente total
  - Distribución capital vs trabajo
  - Estado económico (pérdida / equilibrio / excedente)

- Estados UX:
  - Loading
  - Error claro
  - Éxito explicado

## Criterio de cierre

- Una empresa puede cargar datos y ver su resultado
- El gráfico coincide exactamente con el output del backend

📦 Valor  
Lo invisible se vuelve visible.

---

# 🔴 v0.0.7 — Labor Distribution Engine

🎯 Objetivo  
Cerrar el loop con trabajadores.

## Backend

- Algoritmo configurable de distribución
- Reglas:
  - proporcional salario
  - proporcional productividad
  - fijo + variable
- Trazabilidad completa

## Frontend

- Tabla por empleado
- Vista individual
- Breakdown explicativo del cálculo

## Criterio de cierre

- Cada empleado puede entender su parte
- El cálculo es 100% reproducible

📦 Valor  
Motivación estructural real.

---

# 🟣 v0.0.8 — Certification Layer

🎯 Objetivo  
Convertir cálculo en artefacto legal.

## Incluye

- Hash SHA del período
- Snapshot congelado de inputs
- Snapshot congelado de outputs
- Endpoint:
  - `POST /certify`
  - `GET /certificate/:id`
- Generación:
  - JSON certificable
  - PDF exportable

## Criterio de cierre

- El mismo período no puede modificarse tras certificarse
- El hash cambia si cambia cualquier input

📦 Valor  
Infraestructura legal-tech.

---

# 🧱 v0.0.9 — Refactor & Stability

🎯 Objetivo  
Preparar escalabilidad.

## Incluye

- Separación estricta:
  - domain
  - application
  - infrastructure
- Eliminación de lógica económica fuera del core
- Tests unitarios reales del motor
- Mejora de performance en consultas
- Manejo de concurrencia básico

## Criterio de cierre

- El core no depende de Express ni Mongo
- El sistema puede crecer sin reescribirse

📦 Valor  
Arquitectura profesional.

---

# 🚀 v0.1.0 — Beta Técnica Cerrada

🎯 Objetivo  
Producto defendible.

## Incluye

- Deploy estable (backend + frontend)
- Documentación técnica completa
- README profesional
- Changelog ordenado
- Variables de entorno claras
- Seed de datos de ejemplo
- Script de setup automático

## Criterio de cierre

- Se puede instalar en otro entorno en <30 min
- Demo funcional sin intervención manual

📦 Valor  
Sistema listo para validación real.

---

# 🧭 Camino v0.1.0 → v1.0.0

v0.2 — Multi-period analytics  
v0.3 — Proyecciones económicas  
v0.4 — Simulación de escenarios  
v0.5 — API pública documentada  
v0.6 — Multi-moneda  
v0.7 — Integraciones contables  
v0.8 — Auditor externo  
v0.9 — Optimización performance  
v1.0 — Release estable productivo

---

# 🔖 Versionado

Formato: v0.0.X  
Semantic Versioning  
Cada versión debe incluir:

- Tag Git
- Release notes claras
- Criterio de cierre cumplido
- Valor explícito generado

Sin valor → no existe versión.
