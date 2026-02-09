1️⃣ Modelo de Datos — Variables Globales
Inputs Económicos

Sales

FixedCapitalCosts

FixedLaborCosts

Profit

Amortization

Interests

Period

Currency

InflationIndex

AccountingCriteria

Variables Derivadas

TotalFixedCosts

BreakEvenAmount

VariableCosts

VariableCostRatio

DistributableSurplus

Pesos

WeightCapital

WeightLabor

Resultados de Reparto

CapitalReturn

LaborSurplusPool

EmployeeSurplusLedger[]

Estados y Control

InputState → VALID | INVALID

AuditStatus → PASS | FAIL

ExcedentesCertificate

2️⃣ Invariantes Económicas (NO NEGOCIABLES)

Sales ≥ FixedCosts

VariableCosts ≥ 0

WeightCapital + WeightLabor = 1

CapitalReturn + LaborSurplusPool = DistributableSurplus

Σ EmployeeAllocations = LaborSurplusPool

Ningún valor monetario puede ser negativo

Sin AuditStatus = PASS → no existe certificado

Violación de cualquier invariante ⇒ el sistema falla

3️⃣ Algoritmos Core (Definición Formal)
A. Validación y Normalización

Función: validateInputs() → InputState

Normaliza moneda, inflación y criterios

Detecta datos imposibles

Gatekeeper del sistema

B. Punto de Equilibrio Dinámico

Función: calculateBreakEven() → BreakEvenAmount

BreakEvenAmount =
FixedCapitalCosts
+ FixedLaborCosts
+ AdjustedAmortization
+ Interests

C. Costos Variables Implícitos

Función: inferVariableCosts() → VariableCostStructure

VariableCosts = Sales - Profit - FixedCosts


Incluye checks de razonabilidad.

D. Excedente Distribuible

Función: calculateDistributableSurplus() → DistributableSurplus

Excluye recuperación de capital

Solo valor post–equilibrio

If Sales ≤ BreakEven → 0
Else → Sales - BreakEvenAmount - NonDistributableReturns

E. Pesos Relativos

Función: calculateWeights() → DistributionWeights

WeightCapital = FixedCapitalCosts / TotalFixedCosts
WeightLabor   = FixedLaborCosts / TotalFixedCosts


Normalización obligatoria.

F. Reparto Proporcional

Función: distributeSurplus()

CapitalReturn      = DistributableSurplus × WeightCapital
LaborSurplusPool   = DistributableSurplus × WeightLabor

G. Asignación Interna

Función: allocateLaborSurplus() → EmployeeSurplusLedger[]

Modos:

Salarial

Tiempo

Híbrido (α + β = 1)

Trazabilidad completa por empleado.

H. Auditoría Matemática

Función: auditSystem() → AuditStatus

Valida:

Sumas

Invariantes

No-negatividad

Coherencia inter-step

I. Certificación Económico-Legal

Función: generateCertificate() → ExcedentesCertificate

Incluye:

Inputs firmados

Resultados

Hash verificable

Metadatos (empresa, período, versión)

4️⃣ Meta-Algoritmo (Orquestador)
Orden de Ejecución (INMUTABLE)
1. validateInputs
2. calculateBreakEven
3. inferVariableCosts
4. calculateDistributableSurplus
5. calculateWeights
6. distributeSurplus
7. allocateLaborSurplus
8. auditSystem
9. generateCertificate

Regla Absoluta

Si cualquier paso falla,
el sistema no certifica.

No hay fallback. No hay override.

5️⃣ Outputs Certificables
Único artefacto válido

ExcedentesCertificate

Todo lo demás es intermedio.