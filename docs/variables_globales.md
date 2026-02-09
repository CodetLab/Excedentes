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
