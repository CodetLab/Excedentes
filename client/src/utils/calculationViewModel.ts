/**
 * calculationViewModel.ts
 * 
 * Presentation Transformer: Convierte CalculateResult en ViewModel para UI.
 * 
 * ⚠️ NO calcula. NO recalcula. Solo modela/normaliza.
 * 
 * Responsabilidades:
 * - Normalizar decimales con precisión financiera
 * - Construir tabla de distribución laboral
 * - Garantizar consistencia visual
 * - Validar que la suma de distribución coincida con excedente
 */

import type { CalculateResult } from "../services/apiTypes";

/**
 * Fila de distribución laboral
 */
export interface DistributionRow {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  salaryPercentage: number; // 0 a 100
  amountReceived: number;
  isValid: boolean; // Para detectar errores de redondeo
}

/**
 * ViewModel listo para UI
 */
export interface CalculationViewModel {
  // Estado general
  isValid: boolean;
  economicStatus: "EXCEDENTE" | "DÉFICIT" | "EQUILIBRIO";
  statusMessage: string;

  // Totales principales
  totalAssets: number;
  totalCapitalCosts: number;
  totalSalaries: number;
  declaredProfit: number;

  // Cálculos derivados (ya hechos en backend, solo normalizamos)
  baseSurplus: number;
  distributableSurplus: number;
  previousWithdrawals: number;

  // Punto de equilibrio
  breakEvenPoint: number;

  // Distribución laboral (normalizada)
  laborDistribution: DistributionRow[];

  // Validación de consistencia
  distributionSumAmount: number;
  distributionSumPercentage: number;
  isDistributionBalanced: boolean;
  balanceError: number; // Diferencia en moneda (para detectar redondeo)

  // Metadata
  calculatedAt: string;
  periodName: string;
  currency: string;
  employeeCount: number;

  // Audit trail
  auditStatus: "PASS" | "FAIL";
}

/**
 * Normalizar número a 2 decimales (precisión financiera)
 */
function normalizeAmount(value: unknown): number {
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Determinar estado económico
 */
function getEconomicStatus(
  surplus: number
): "EXCEDENTE" | "DÉFICIT" | "EQUILIBRIO" {
  if (surplus > 0) return "EXCEDENTE";
  if (surplus < 0) return "DÉFICIT";
  return "EQUILIBRIO";
}

/**
 * Construir tabla de distribución laboral
 * 
 * Input: resultado del backend con datos de empleados
 * Output: tabla normalizada lista para UI
 */
function buildDistributionTable(
  result: CalculateResult,
  distributableSurplus: number
): DistributionRow[] {
  const distribution: DistributionRow[] = [];

  if (!result.auditTrail?.employeeSurplusLedger) {
    return distribution;
  }

  const ledger = result.auditTrail.employeeSurplusLedger;
  const totalSalaries = normalizeAmount(result.input.fixedLaborCosts);

  if (ledger.length === 0 || totalSalaries === 0) {
    return distribution;
  }

  for (const employee of ledger) {
    const baseSalary = normalizeAmount(employee.amount);

    // Porcentaje del total de salarios
    const salaryPercentage = totalSalaries > 0
      ? normalizeAmount((baseSalary / totalSalaries) * 100)
      : 0;

    // Monto del excedente que le corresponde
    const amountReceived = totalSalaries > 0
      ? normalizeAmount(
          (baseSalary / totalSalaries) * distributableSurplus
        )
      : 0;

    distribution.push({
      employeeId: employee.id || "",
      employeeName: employee.name || "Empleado Desconocido",
      baseSalary,
      salaryPercentage,
      amountReceived,
      isValid: true, // Validaremos al final
    });
  }

  return distribution;
}

/**
 * FUNCIÓN PRINCIPAL: Construir ViewModel
 * 
 * Responsabilidad única: Transformar CalculateResult en vista para UI.
 * Nunca modifica el original.
 * Nunca llama APIs.
 * Nunca recalcula lógica económica.
 * 
 * @param result Resultado del backend (CalculateResult)
 * @returns ViewModel listo para renderizar
 */
export function buildCalculationViewModel(
  result: CalculateResult
): CalculationViewModel {
  // Normalizar todos los números
  const totalCapitalCosts = normalizeAmount(result.input.fixedCapitalCosts);
  const totalSalaries = normalizeAmount(result.input.fixedLaborCosts);
  const declaredProfit = normalizeAmount(result.input.profit);
  const totalRevenue = normalizeAmount(result.totalRevenue);
  const breakEvenPoint = normalizeAmount(result.breakEven);
  const distributableSurplus = normalizeAmount(result.surplus);

  // Asumir que previousWithdrawals es 0 (por ahora, sin datos)
  const previousWithdrawals = 0;
  const baseSurplus = totalRevenue - totalCapitalCosts - totalSalaries;

  // Construir tabla de distribución
  const laborDistribution = buildDistributionTable(
    result,
    distributableSurplus
  );

  // Validar que la suma de distribución coincida
  const distributionSumAmount = normalizeAmount(
    laborDistribution.reduce((sum, row) => sum + row.amountReceived, 0)
  );
  const distributionSumPercentage = normalizeAmount(
    laborDistribution.reduce((sum, row) => sum + row.salaryPercentage, 0)
  );

  // Error de balance (diferencia entre excedente distribuible y suma de distribución)
  const balanceError = normalizeAmount(
    distributableSurplus - distributionSumAmount
  );
  const isDistributionBalanced = Math.abs(balanceError) < 0.01; // Tolerancia de redondeo

  // Determinar estado económico
  const economicStatus = getEconomicStatus(distributableSurplus);
  const statusMessage =
    economicStatus === "EXCEDENTE"
      ? `✅ Excedente disponible: ${distributableSurplus.toLocaleString("es-UY", {
          style: "currency",
          currency: result.input.currency,
        })}`
      : economicStatus === "DÉFICIT"
        ? `❌ Déficit: ${Math.abs(distributableSurplus).toLocaleString("es-UY", {
            style: "currency",
            currency: result.input.currency,
          })}`
        : "⚠️ Equilibrio exacto (sin excedente ni déficit)";

  // Total de activos (para referencia visual)
  const totalAssets = normalizeAmount(
    totalCapitalCosts +
      totalSalaries +
      previousWithdrawals +
      declaredProfit
  );

  // Validez general del ViewModel
  const isValid =
    isDistributionBalanced &&
    result.auditTrail.status === "PASS" &&
    economicStatus === "EXCEDENTE";

  return {
    // Estado general
    isValid,
    economicStatus,
    statusMessage,

    // Totales principales
    totalAssets,
    totalCapitalCosts,
    totalSalaries,
    declaredProfit,

    // Cálculos derivados
    baseSurplus: normalizeAmount(baseSurplus),
    distributableSurplus,
    previousWithdrawals,

    // Punto de equilibrio
    breakEvenPoint,

    // Distribución laboral
    laborDistribution,

    // Validación de consistencia
    distributionSumAmount,
    distributionSumPercentage,
    isDistributionBalanced,
    balanceError,

    // Metadata
    calculatedAt: result.auditTrail.calculatedAt,
    periodName: result.auditTrail.periodName,
    currency: result.input.currency,
    employeeCount: result.input.employeeCount,

    // Audit trail
    auditStatus: result.auditTrail.status,
  };
}

/**
 * Validar que el ViewModel es seguro para mostrar
 * (chequeo adicional en UI si es necesario)
 */
export function isViewModelValid(vm: CalculationViewModel): boolean {
  return (
    vm.isDistributionBalanced &&
    vm.auditStatus === "PASS" &&
    vm.balanceError === 0
  );
}
