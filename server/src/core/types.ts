// core/types.ts

// ---------------------------
// EMPLOYEE ALLOCATION
// ---------------------------
export interface EmployeeAllocation {
  id: string
  name?: string
  amount: number
}

// ---------------------------
// ENGINE INPUT
// ---------------------------
export interface EngineInput {
  Sales: number
  FixedCapitalCosts: number
  FixedLaborCosts: number
  Profit: number
  Amortization: number
  Interests: number
  Period: string
  Currency: string
  InflationIndex: number
  AccountingCriteria: string
  employees?: EmployeeAllocation[]
}

// ---------------------------
// ENGINE RESULT
// ---------------------------
export interface EngineResult {
  auditStatus: "PASS" | "FAIL"
  certificate?: any
  distributableSurplus: number
  capitalReturn: number
  laborSurplusPool: number
  employeeSurplusLedger: EmployeeAllocation[]
  weightCapital: number
  weightLabor: number
}
