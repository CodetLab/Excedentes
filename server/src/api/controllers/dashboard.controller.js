import dashboardService from "../../services/dashboard.service.js";
import dataConsolidationService from "../../services/data-consolidation.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * GET /api/dashboard/summary
 * Retorna resumen para gráficos del dashboard
 */
export const getSummary = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const summary = await dashboardService.getSummary(companyId);
  sendSuccess(res, summary);
});

/**
 * GET /api/dashboard/kpis
 * Retorna KPIs principales
 */
export const getKPIs = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const kpis = await dashboardService.getKPIs(companyId);
  sendSuccess(res, kpis);
});

/**
 * GET /api/dashboard/period-summary
 * NUEVO v0.0.4: Consolidar datos económicos por período SIN ejecutar cálculo
 * 
 * Query params:
 * - month: Mes (1-12)
 * - year: Año
 * companyId viene del JWT
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
  console.log("[DASHBOARD.getPeriodSummary] START", {
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) : "MISSING",
    userId: req.userId,
    companyId: req.companyId,
    role: req.role,
    queryParams: req.query
  });

  const companyId = req.companyId;
  const { month, year } = req.query;

  if (!companyId) {
    console.error("[DASHBOARD.getPeriodSummary] BLOCKED - companyId is null/undefined");
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }

  // Validar parámetros requeridos
  if (!month || !year) {
    console.error("[DASHBOARD.getPeriodSummary] Missing query params", { month, year });
    return res.status(400).json({
      success: false,
      error: "month y year son requeridos"
    });
  }

  console.log("[DASHBOARD.getPeriodSummary] Parsing period", { month, year, monthType: typeof month, yearType: typeof year });

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    console.error("[DASHBOARD.getPeriodSummary] Invalid month", { month, monthNum });
    return sendError(res, 400, `month debe ser número 1-12, recibió: ${month}`);
  }

  if (!Number.isInteger(yearNum) || yearNum < 2000) {
    console.error("[DASHBOARD.getPeriodSummary] Invalid year", { year, yearNum });
    return sendError(res, 400, `year debe ser número >= 2000, recibió: ${year}`);
  }

  console.log("[DASHBOARD.getPeriodSummary] Querying consolidation service", { companyId, monthNum, yearNum });


  // Consolidar datos sin ejecutar el motor
  const consolidatedData = await dataConsolidationService.consolidateByPeriod(
    companyId,
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