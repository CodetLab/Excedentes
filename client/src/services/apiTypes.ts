/**
 * Tipos API - Sincronización Backend/Frontend
 * 
 * Mantén estos tipos en sincronía con backend/src/api/types/
 * Version: v0.0.6 - Economic Dashboard
 */

// ============================================================================
// Error Handling
// ============================================================================

export type ApiError = {
  message: string;
  status: number;
  details?: unknown;
};

export interface ValidationError extends ApiError {
  fields?: Record<string, string>;
}

export interface AuthenticationError extends ApiError {
  code?: "INVALID_TOKEN" | "TOKEN_EXPIRED" | "INSUFFICIENT_PERMISSIONS";
}

// ============================================================================
// JWT & Authentication
// ============================================================================

export interface JWTPayload {
  sub: string;              // userId
  email: string;
  companyId: string;        // MongoDB ObjectId
  role: "admin" | "company";
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  companyId: string;
  role: "admin" | "company";
}

// ============================================================================
// Economic Calculation Types
// ============================================================================

export interface EmployeeInput {
  id?: string;
  role?: string;
  name?: string;
  baseSalary?: number;
  quantity?: number;
  amount?: number;      // Legacy field
  benefits?: number;
}

/** Datos enviados al endpoint POST /api/calculate */
export interface CalculateInput {
  // Obligatorios
  sales: number;
  
  // Costos
  fixedCapitalCosts?: number;
  fixedLaborCosts?: number;
  variableCosts?: number;
  
  // Resultado
  profit?: number;
  
  // Opcionales
  amortization?: number;
  interests?: number;
  
  // Período
  month?: number;
  year?: number;
  period?: string;
  
  // Configuración
  currency?: "USD" | "ARS" | "EUR";
  inflationIndex?: number;
  accountingCriteria?: "ACCRUAL" | "CASH";
  
  // Detalles
  employees?: EmployeeInput[];
}

export interface CalculateDistribution {
  capitalReturn: number;
  laborSurplusPool: number;
  weightCapital: number;
  weightLabor: number;
  capitalPercentage?: number;
  laborPercentage?: number;
}

export interface CalculateAuditTrail {
  status: "PASS" | "FAIL";
  certificate?: unknown;
  employeeSurplusLedger?: EmployeeInput[];
  calculatedAt: string;
  periodId?: string | null;
  periodName?: string;
  calculatedBy?: string;
}

export interface CalculateInterpretation {
  summary?: string;
  nextSteps?: string[];
  warnings?: string[];
}

/** Resultado del cálculo económico */
export interface CalculateResult {
  breakEven: number;
  totalRevenue: number;
  totalCost: number;
  surplus: number;
  status?: "PERDIDA" | "EQUILIBRIO" | "EXCEDENTE";
  interpretation?: CalculateInterpretation;
  
  distribution: CalculateDistribution;
  auditTrail: CalculateAuditTrail;
  
  input: CalculateInput;
  version?: string;
  processingTimeMs?: number;
}

// ============================================================================
// Response Envelopes
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string[] | Record<string, string>;
  metadata?: {
    timestamp?: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// Economic Status & UI Helpers
// ============================================================================

export type EconomicStatus = "PERDIDA" | "EQUILIBRIO" | "EXCEDENTE";

export interface EconomicFormData {
  sales: number;
  fixedCapitalCosts?: number;
  fixedLaborCosts?: number;
  profit?: number;
  amortization?: number;
  interests?: number;
}

export function getEconomicStatus(surplus: number): EconomicStatus {
  if (surplus < 0) return "PERDIDA";
  if (surplus === 0) return "EQUILIBRIO";
  return "EXCEDENTE";
}

export const STATUS_COLORS: Record<EconomicStatus, string> = {
  PERDIDA: "#d32f2f",      // Red
  EQUILIBRIO: "#ff9800",   // Orange
  EXCEDENTE: "#4caf50",    // Green
};
