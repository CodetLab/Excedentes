import gananciasService from "../../services/ganancias.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * GET /api/ganancias - Obtener ganancias del usuario
 */
export const get = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const ganancias = await gananciasService.get(companyId);
  sendSuccess(res, ganancias);
});

/**
 * POST /api/ganancias - Crear o actualizar ganancias
 */
export const createOrUpdate = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const ganancias = await gananciasService.createOrUpdate(req.body, companyId);
  sendSuccess(res, ganancias, 201);
});

/**
 * DELETE /api/ganancias - Eliminar ganancias
 */
export const remove = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const result = await gananciasService.delete(companyId);
  sendSuccess(res, result);
});

/**
 * GET /api/ganancias/total - Obtener total de ganancias
 */
export const getTotal = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const total = await gananciasService.getTotal(companyId);
  sendSuccess(res, { total });
});
