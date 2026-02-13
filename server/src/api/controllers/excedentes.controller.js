import excedentesService from "../../services/excedentes.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * POST /api/excedentes/calc
 * Ejecuta el cálculo de excedentes con datos de la DB o overrides
 */
export const calculate = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const result = await excedentesService.calculate(req.body, userId);
  sendSuccess(res, result);
});
