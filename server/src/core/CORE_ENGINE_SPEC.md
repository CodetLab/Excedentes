# EXCEDENTES Core Engine

Especificacion tecnica para ingenieros backend. Este documento describe el modelo logico de datos, las invariantes y el flujo de ejecucion del motor economico central. Es agnostico a frameworks y no cubre UI ni DB.

## 1. Modelo de Datos (Logico)

Entradas:
- `Sales`
- `FixedCapitalCosts`
- `FixedLaborCosts`
- `Profit`
- `Amortization`
- `Interests`
- `Period`
- `Currency`
- `InflationIndex`
- `AccountingCriteria`

Variables Derivadas:
- `TotalFixedCosts`
- `BreakEvenAmount`
- `VariableCosts`
- `VariableCostRatio`
- `DistributableSurplus`

Pesos:
- `WeightCapital`
- `WeightLabor`

Resultados:
- `CapitalReturn`
- `LaborSurplusPool`
- `EmployeeSurplusLedger[]`

Estado y Control:
- `InputState`: `VALID` | `INVALID`
- `AuditStatus`: `PASS` | `FAIL`
- `ExcedentesCertificate`

## 2. Invariantes Economicas (No Negociables)

- `Sales >= FixedCosts`
- `VariableCosts >= 0`
- `WeightCapital + WeightLabor = 1`
- `CapitalReturn + LaborSurplusPool = DistributableSurplus`
- `Sum(EmployeeAllocations) = LaborSurplusPool`
- Ningun valor monetario puede ser negativo
- Sin `AuditStatus = PASS` -> no hay certificado
- Cualquier violacion de invariantes -> falla del sistema

## 3. Algoritmos Core (Definicion Formal)

Cada algoritmo se define por proposito, nombre de funcion, entradas, salidas y reglas.

### A. validateInputs() -> InputState
- Proposito: Validar entradas economicas contra reglas de dominio.
- Entradas: Todos los campos de entrada.
- Salida: `InputState` (`VALID` o `INVALID`).
- Reglas: Rechaza valores faltantes, moneda/periodo invalidos o criterios contables invalidados.

### B. calculateBreakEven() -> BreakEvenAmount
- Proposito: Calcular el monto de equilibrio.
- Entradas: `TotalFixedCosts`, `VariableCostRatio` (o equivalente).
- Salida: `BreakEvenAmount`.
- Reglas: Debe ser no negativo; si la relacion es invalida, poner `InputState = INVALID`.

### C. inferVariableCosts() -> VariableCostStructure
- Proposito: Inferir costos variables desde el contexto contable.
- Entradas: `Sales`, `TotalFixedCosts`, `Profit`, `Amortization`, `Interests`, `AccountingCriteria`.
- Salida: `VariableCosts`, `VariableCostRatio`.
- Reglas: Asegurar `VariableCosts >= 0`.

### D. calculateDistributableSurplus() -> DistributableSurplus
- Proposito: Determinar el excedente distribuible.
- Entradas: `Sales`, `TotalFixedCosts`, `VariableCosts`, `Profit`, `Amortization`, `Interests`.
- Salida: `DistributableSurplus`.
- Reglas: Debe ser no negativo; de lo contrario falla auditoria.

### E. calculateWeights() -> DistributionWeights
- Proposito: Calcular los pesos de distribucion entre capital y trabajo.
- Entradas: `FixedCapitalCosts`, `FixedLaborCosts`, `AccountingCriteria`.
- Salida: `WeightCapital`, `WeightLabor`.
- Reglas: `WeightCapital + WeightLabor = 1`.

### F. distributeSurplus()
- Proposito: Dividir el excedente en retorno al capital y fondo laboral.
- Entradas: `DistributableSurplus`, `WeightCapital`, `WeightLabor`.
- Salidas: `CapitalReturn`, `LaborSurplusPool`.
- Reglas: La suma debe igualar `DistributableSurplus`.

### G. allocateLaborSurplus() -> EmployeeSurplusLedger[]
- Proposito: Asignar el excedente laboral a empleados.
- Entradas: `LaborSurplusPool`, reglas de asignacion, datos de dotacion.
- Salida: `EmployeeSurplusLedger[]`.
- Reglas: `Sum(EmployeeAllocations) = LaborSurplusPool`.

### H. auditSystem() -> AuditStatus
- Proposito: Verificar invariantes y trazabilidad.
- Entradas: Valores derivados, pesos, resultados y ledger.
- Salida: `AuditStatus` (`PASS` o `FAIL`).
- Reglas: Cualquier violacion de invariantes -> `FAIL`.

### I. generateCertificate() -> ExcedentesCertificate
- Proposito: Crear el artefacto certificable.
- Entradas: `AuditStatus`, audit trail inmutable, salidas del calculo.
- Salida: `ExcedentesCertificate`.
- Reglas: Solo generar si `AuditStatus = PASS`.

## 4. Orquestador (Orden de Ejecucion Inmutable)

Orden fijo y no negociable:

1. `validateInputs`
2. `calculateBreakEven`
3. `inferVariableCosts`
4. `calculateDistributableSurplus`
5. `calculateWeights`
6. `distributeSurplus`
7. `allocateLaborSurplus`
8. `auditSystem`
9. `generateCertificate`

Regla: si algun paso falla, el sistema no debe certificar. Sin fallback, sin override.

## 5. Estrategia de Testing

Tests black-box (por escenarios):
- Empresa sin ganancia
- Empresa con ganancia minima
- Estructura dominada por capital
- Estructura dominada por trabajo
- Entradas economicas invalidas

Tests de invariantes (no deben cambiar):
- Ningun valor monetario negativo
- Los pesos suman 1
- Sumas de distribucion consistentes
- Sin PASS => sin certificado

Edge cases:
- `Sales == BreakEvenAmount`
- `FixedCosts == 0` (bloqueado)
- Profit negativo
- Inflacion extrema

Enfatizar: los tests son input -> output. NO testear funciones internas.

## 6. Output

El unico artefacto certificable es `ExcedentesCertificate`. Todo lo demas es intermedio.
