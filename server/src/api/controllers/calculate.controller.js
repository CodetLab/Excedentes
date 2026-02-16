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
  const { month, year } = req.body;
  
  // 🔐 FASE 5: Extraer identidad del JWT, no del body
  const userId = req.userId;
  const companyId = req.companyId;

  // Validar campos requeridos
  if (!month || !year) {
    return res.status(400).json({
      success: false,
      error: "month y year son requeridos",
      timestamp: new Date().toISOString(),
    });
  }

  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: "Usuario no asignado a ninguna empresa",
      timestamp: new Date().toISOString(),
    });
  }

  const result = await calculationService.calculateByPeriod(
    companyId,  // Usar companyId como identificador principal
    month, 
    year
  );
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
 * 🔐 FASE 5: Valida que el período pertenece a la empresa del usuario
 */
export const calculateForPeriod = asyncHandler(async (req, res) => {
  const { periodId } = req.params;
  const companyId = req.companyId;
  const userRole = req.role;

  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: "Usuario no asignado a ninguna empresa",
      timestamp: new Date().toISOString(),
    });
  }

  const result = await calculationService.calculateForPeriod(
    periodId,
    companyId,
    userRole
  );
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
