import dashboardService from "../../services/dashboard.service.js";
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