export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

// Types for calculation endpoint
export interface EmployeeInput {
  id: string;
  name?: string;
  amount: number;
}

export interface CalculateInput {
  sales: number;
  fixedCapitalCosts?: number;
  fixedLaborCosts?: number;
  profit?: number;
  amortization?: number;
  interests?: number;
  period?: string;
  currency?: "USD" | "ARS" | "EUR";
  inflationIndex?: number;
  accountingCriteria?: "ACCRUAL" | "CASH";
  employees?: EmployeeInput[];
}

export interface CalculateDistribution {
  capitalReturn: number;
  laborSurplusPool: number;
  weightCapital: number;
  weightLabor: number;
}

export interface CalculateAuditTrail {
  status: "PASS" | "FAIL";
  certificate: unknown;
  employeeSurplusLedger: EmployeeInput[];
  calculatedAt: string;
  periodId: string | null;
  periodName: string;
}

export interface CalculateResult {
  breakEven: number;
  totalRevenue: number;
  totalCost: number;
  surplus: number;
  distribution: CalculateDistribution;
  auditTrail: CalculateAuditTrail;
  input: {
    sales: number;
    fixedCapitalCosts: number;
    fixedLaborCosts: number;
    profit: number;
    amortization: number;
    interests: number;
    currency: string;
    inflationIndex: number;
    accountingCriteria: string;
    employeeCount: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[];
}

// Economic status based on surplus
export type EconomicStatus = "PERDIDA" | "EQUILIBRIO" | "EXCEDENTE";

export function getEconomicStatus(surplus: number): EconomicStatus {
  if (surplus < 0) return "PERDIDA";
  if (surplus === 0) return "EQUILIBRIO";
  return "EXCEDENTE";
}
