// core/steps.ts

import { EmployeeAllocation, EngineInput } from "./types.js";

// ---------------------------
// CORE STEPS (funciones puras, placeholders)
// ---------------------------

export function validateInputs(input: EngineInput): "VALID" | "INVALID" {
  if (!input) return "INVALID";

  const requiredText = [input.Period, input.Currency, input.AccountingCriteria];
  if (requiredText.some((value) => !value || value.trim().length === 0)) {
    return "INVALID";
  }

  const numericFields = [
    input.Sales,
    input.FixedCapitalCosts,
    input.FixedLaborCosts,
    input.Profit,
    input.Amortization,
    input.Interests,
    input.InflationIndex,
  ];
  if (numericFields.some((value) => !Number.isFinite(value))) {
    return "INVALID";
  }

  const totalFixed = input.FixedCapitalCosts + input.FixedLaborCosts;
  if (totalFixed <= 0) return "INVALID";

  if (
    input.Sales < 0 ||
    input.FixedCapitalCosts < 0 ||
    input.FixedLaborCosts < 0 ||
    input.Amortization < 0 ||
    input.Interests < 0 ||
    input.InflationIndex <= 0 ||
    input.Profit < 0
  ) {
    return "INVALID";
  }

  if (input.Sales < totalFixed) return "INVALID";

  return "VALID";
}

export function calculateBreakEven(input: EngineInput): number {
  return input.FixedCapitalCosts + input.FixedLaborCosts;
}

export function inferVariableCosts(input: EngineInput): { VariableCosts: number; VariableCostRatio: number } {
  const totalFixed = input.FixedCapitalCosts + input.FixedLaborCosts;
  const variableCosts = Math.max(
    input.Sales - input.Profit - totalFixed - input.Amortization - input.Interests,
    0
  );
  const ratio = input.Sales > 0 ? variableCosts / input.Sales : 0;
  return { VariableCosts: variableCosts, VariableCostRatio: ratio };
}

export function calculateDistributableSurplus(data: {
  Sales: number;
  breakEven: number;
  variableCosts: { VariableCosts: number };
}): number {
  return data.Sales - data.breakEven - data.variableCosts.VariableCosts;
}

export function calculateWeights(input: EngineInput): { weightCapital: number; weightLabor: number } {
  const totalFixed = input.FixedCapitalCosts + input.FixedLaborCosts;
  const weightCapital = totalFixed ? input.FixedCapitalCosts / totalFixed : 0;
  const weightLabor = totalFixed ? input.FixedLaborCosts / totalFixed : 0;
  return { weightCapital, weightLabor };
}

export function distributeSurplus(
  distributableSurplus: number,
  weights: { weightCapital: number; weightLabor: number }
) {
  return {
    capitalReturn: distributableSurplus * weights.weightCapital,
    laborSurplusPool: distributableSurplus * weights.weightLabor,
  };
}

export function allocateLaborSurplus(
  laborSurplusPool: number,
  employees: EmployeeAllocation[] = []
): EmployeeAllocation[] {
  if (!employees.length) return [];
  const perEmployee = laborSurplusPool / employees.length;
  return employees.map((e) => ({ ...e, amount: perEmployee }));
}

export function auditSystem(data: {
  input: EngineInput;
  variableCosts: { VariableCosts: number };
  weights: { weightCapital: number; weightLabor: number };
  distributableSurplus: number;
  distribution: { capitalReturn: number; laborSurplusPool: number };
  employeeSurplusLedger: EmployeeAllocation[];
}): "PASS" | "FAIL" {
  const epsilon = 1e-6;
  const totalFixed = data.input.FixedCapitalCosts + data.input.FixedLaborCosts;
  const sumEmployee = data.employeeSurplusLedger.reduce((sum, e) => sum + e.amount, 0);
  const sumDistrib = data.distribution.capitalReturn + data.distribution.laborSurplusPool;

  const monetaryValues = [
    data.input.Sales,
    data.input.FixedCapitalCosts,
    data.input.FixedLaborCosts,
    data.input.Profit,
    data.input.Amortization,
    data.input.Interests,
    data.variableCosts.VariableCosts,
    data.distributableSurplus,
    data.distribution.capitalReturn,
    data.distribution.laborSurplusPool,
    ...data.employeeSurplusLedger.map((entry) => entry.amount),
  ];

  if (monetaryValues.some((value) => value < 0)) return "FAIL";
  if (data.input.Sales < totalFixed) return "FAIL";
  if (data.variableCosts.VariableCosts < 0) return "FAIL";

  const weightSum = data.weights.weightCapital + data.weights.weightLabor;
  if (Math.abs(weightSum - 1) > epsilon) return "FAIL";

  if (Math.abs(sumDistrib - data.distributableSurplus) > epsilon) return "FAIL";
  if (Math.abs(sumEmployee - data.distribution.laborSurplusPool) > epsilon) return "FAIL";

  return "PASS";
}

export function generateCertificate(data: any): any {
  // placeholder simple
  return { issuedAt: new Date().toISOString(), data };
}
