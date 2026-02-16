import excedentesService from "../../services/excedentes.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * POST /api/excedentes/calc
 * Ejecuta el cálculo de excedentes con datos de la DB o overrides
 */
export const calculate = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const result = await excedentesService.calculate(req.body, companyId);
  sendSuccess(res, result);
});
