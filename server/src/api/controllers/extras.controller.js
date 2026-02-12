import extrasService from "../../services/extras.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getOrCreateUserId } from "../../utils/requestSanitizer.js";

/**
 * GET /api/extras - Obtener todos los extras
 */
export const getAll = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const extras = await extrasService.getAll(userId);
  sendSuccess(res, extras);
});

/**
 * GET /api/extras/:id - Obtener un extra por ID
 */
export const getById = asyncHandler(async (req, res) => {
  const extra = await extrasService.getById(req.params.id);
  sendSuccess(res, extra);
});

/**
 * POST /api/extras - Crear un nuevo extra
 */
export const create = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, req.body);
  const extra = await extrasService.create(req.body, userId);
  sendSuccess(res, extra, 201);
});

/**
 * PUT /api/extras/:id - Actualizar un extra
 */
export const update = asyncHandler(async (req, res) => {
  const extra = await extrasService.update(req.params.id, req.body);
  sendSuccess(res, extra);
});

/**
 * DELETE /api/extras/:id - Eliminar un extra
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await extrasService.delete(req.params.id);
  sendSuccess(res, result);
});

/**
 * GET /api/extras/summary/totals - Obtener resumen de extras
 */
export const getSummary = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const summary = await extrasService.getSummary(userId);
  sendSuccess(res, summary);
});
