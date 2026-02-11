// core/orchestrator.ts

import {
  validateInputs,
  calculateBreakEven,
  inferVariableCosts,
  calculateDistributableSurplus,
  calculateWeights,
  distributeSurplus,
  allocateLaborSurplus,
  auditSystem,
  generateCertificate,
} from "./steps.js";
import { EngineInput, EngineResult } from "./types.js";

export function runExcedentesEngine(input: EngineInput): EngineResult {
  const state = validateInputs(input);
  if (state !== "VALID") {
    return {
      auditStatus: "FAIL",
      certificate: null,
      distributableSurplus: 0,
      capitalReturn: 0,
      laborSurplusPool: 0,
      employeeSurplusLedger: [],
      weightCapital: 0,
      weightLabor: 0,
    };
  }

  const breakEven = calculateBreakEven(input);
  const variableCosts = inferVariableCosts(input);
  const distributableSurplus = calculateDistributableSurplus({
    Sales: input.Sales,
    breakEven,
    variableCosts,
  });

  const weights = calculateWeights(input);
  const distribution = distributeSurplus(distributableSurplus, weights);
  const employeeSurplusLedger = allocateLaborSurplus(
    distribution.laborSurplusPool,
    input.employees
  );

  const auditStatus = auditSystem({
    input,
    variableCosts,
    weights,
    distributableSurplus,
    distribution,
    employeeSurplusLedger,
  });

  if (auditStatus !== "PASS") {
    return {
      auditStatus: "FAIL",
      certificate: null,
      distributableSurplus: 0,
      capitalReturn: 0,
      laborSurplusPool: 0,
      employeeSurplusLedger: [],
      weightCapital: 0,
      weightLabor: 0,
    };
  }

  const certificate = generateCertificate({
    distributableSurplus,
    distribution,
    employeeSurplusLedger,
  });

  return {
    auditStatus,
    certificate,
    distributableSurplus,
    capitalReturn: distribution.capitalReturn,
    laborSurplusPool: distribution.laborSurplusPool,
    employeeSurplusLedger,
    weightCapital: weights.weightCapital,
    weightLabor: weights.weightLabor,
  };
}
