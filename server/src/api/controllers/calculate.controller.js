import calculationService from "../../services/calculation.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * POST /calculate
 * Endpoint principal de cálculo económico según spec v0.0.4
 * 
 * Body:
 * {
 *   sales: number,
 *   fixedCapitalCosts: number,
 *   fixedLaborCosts: number,
 *   profit: number,
 *   amortization: number,
 *   interests: number,
 *   period?: string,
 *   currency?: "USD" | "ARS" | "EUR",
 *   inflationIndex?: number,
 *   accountingCriteria?: "ACCRUAL" | "CASH",
 *   employees?: Array<{ id: string, name?: string, amount: number }>
 * }
 * 
 * Response (normalizada v0.0.4):
 * {
 *   success: true,
 *   data: { breakEven, totalRevenue, totalCost, surplus, distribution, auditTrail, input },
 *   timestamp: number
 * }
 * 
 * Errores económicos:
 * - InvalidEconomicState: Ventas < Ganancia + Costos Fijos
 * - Validaciones: Valores negativos, datos inválidos
 */
export const calculate = asyncHandler(async (req, res) => {
  const result = await calculationService.calculateDirect(req.body);
  sendSuccess(res, result);
});

/**
 * POST /calculate/period/:periodId
 * Calcular usando datos de un período guardado
 */
export const calculateForPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;
  const result = await calculationService.calculateForPeriod(periodId);
  sendSuccess(res, result);
});

/**
 * GET /calculate/costs/:companyId
 * Obtener totales de costos calculados para una empresa
 */
export const getCostTotals = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const totals = await calculationService.getCostTotals(companyId);
  sendSuccess(res, totals);
});
