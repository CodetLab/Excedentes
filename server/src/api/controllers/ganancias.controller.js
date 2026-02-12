import gananciasService from "../../services/ganancias.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getOrCreateUserId } from "../../utils/requestSanitizer.js";

/**
 * GET /api/ganancias - Obtener ganancias del usuario
 */
export const get = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const ganancias = await gananciasService.get(userId);
  sendSuccess(res, ganancias);
});

/**
 * POST /api/ganancias - Crear o actualizar ganancias
 */
export const createOrUpdate = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, req.body);
  const ganancias = await gananciasService.createOrUpdate(req.body, userId);
  sendSuccess(res, ganancias, 201);
});

/**
 * DELETE /api/ganancias - Eliminar ganancias
 */
export const remove = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const result = await gananciasService.delete(userId);
  sendSuccess(res, result);
});

/**
 * GET /api/ganancias/total - Obtener total de ganancias
 */
export const getTotal = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const total = await gananciasService.getTotal(userId);
  sendSuccess(res, { total });
});
