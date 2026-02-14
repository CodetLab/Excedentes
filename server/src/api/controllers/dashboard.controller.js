import dashboardService from "../../services/dashboard.service.js";
import dataConsolidationService from "../../services/data-consolidation.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * GET /api/dashboard/summary
 * Retorna resumen para gráficos del dashboard
 */
export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const summary = await dashboardService.getSummary(userId);
  sendSuccess(res, summary);
});

/**
 * GET /api/dashboard/kpis
 * Retorna KPIs principales
 */
export const getKPIs = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const kpis = await dashboardService.getKPIs(userId);
  sendSuccess(res, kpis);
});

/**
 * GET /api/dashboard/period-summary
 * NUEVO v0.0.4: Consolidar datos económicos por período SIN ejecutar cálculo
 * 
 * Query params:
 * - userId: ID del usuario/empresa
 * - month: Mes (1-12)
 * - year: Año
 * 
 * Response:
 * {
 *   sales,
 *   totalPersonal,
 *   totalCapital,
 *   totalExtras,
 *   totalFixedCosts,
 *   totalCosts,
 *   details: { ... }
 * }
 */
export const getPeriodSummary = asyncHandler(async (req, res) => {
  const { userId, month, year } = req.query;

  // Validar parámetros requeridos
  if (!userId || !month || !year) {
    return res.status(400).json({
      success: false,
      error: "userId, month y year son requeridos"
    });
  }

const monthNum = Number(month);
const yearNum = Number(year);

if (!Number.isInteger(monthNum) || !Number.isInteger(yearNum)) {
  throw new Error("Invalid parameters");
}


  // Consolidar datos sin ejecutar el motor
  const consolidatedData = await dataConsolidationService.consolidateByPeriod(
    userId,
    monthNum,
    yearNum
  );

  // Formatear respuesta para el dashboard
  const summary = {
    period: consolidatedData.period,
    sales: consolidatedData.sales,
    profit: consolidatedData.profit,
    totalPersonal: consolidatedData.fixedLaborCosts + consolidatedData.variableLaborCosts,
    totalCapital: consolidatedData.fixedCapitalCosts + consolidatedData.variableCapitalCosts,
    totalExtras: consolidatedData.extrasCosts,
    totalFixedCosts: consolidatedData.totalFixedCosts,
    totalCosts: consolidatedData.totalCosts,
    details: consolidatedData.details,
    breakdown: {
      fixedCapitalCosts: consolidatedData.fixedCapitalCosts,
      variableCapitalCosts: consolidatedData.variableCapitalCosts,
      fixedLaborCosts: consolidatedData.fixedLaborCosts,
      variableLaborCosts: consolidatedData.variableLaborCosts,
    }
  };

  sendSuccess(res, summary);
});