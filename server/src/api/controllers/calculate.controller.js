import calculationService from "../../services/calculation.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * POST /calculate
 * NUEVO v0.0.4: Calcula usando datos persistidos en la base de datos
 * 
 * Body:
 * {
 *   userId: string,     // ID del usuario/empresa
 *   month: number,      // Mes (1-12)
 *   year: number        // Año
 * }
 * 
 * Response (normalizada v0.0.4):
 * {
 *   success: true,
 *   data: {
 *     breakEven,
 *     totalRevenue,
 *     totalCost,
 *     surplus,
 *     distribution,
 *     auditTrail,
 *     input,
 *     consolidation
 *   },
 *   timestamp: number
 * }
 * 
 * Errores económicos:
 * - InvalidEconomicState: Ventas < Ganancia + Costos Fijos
 * - ValidationError: Datos ausentes o inválidos
 * - NotFoundError: No hay datos para el período
 */
export const calculate = asyncHandler(async (req, res) => {
  const { userId, month, year } = req.body;
  
  // Validar campos requeridos
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: "userId es requerido"
    });
  }
  
  if (!month || !year) {
    return res.status(400).json({
      success: false,
      error: "month y year son requeridos"
    });
  }

  const result = await calculationService.calculateByPeriod(userId, month, year);
  sendSuccess(res, result);
});

/**
 * POST /calculate/direct
 * Calcular con datos enviados directamente (simulación sin persistir)
 */
export const calculateDirect = asyncHandler(async (req, res) => {
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
