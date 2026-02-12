import personalService from "../../services/personal.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getOrCreateUserId } from "../../utils/requestSanitizer.js";

/**
 * GET /api/personal/propio - Obtener personal propio
 */
export const getPropio = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const personal = await personalService.getPropio(userId);
  sendSuccess(res, personal);
});

/**
 * GET /api/personal/terceros - Obtener personal terceros
 */
export const getTerceros = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const personal = await personalService.getTerceros(userId);
  sendSuccess(res, personal);
});

/**
 * GET /api/personal - Obtener todo el personal
 */
export const getAll = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const personal = await personalService.getAll(userId);
  sendSuccess(res, personal);
});

/**
 * GET /api/personal/:id - Obtener personal por ID
 */
export const getById = asyncHandler(async (req, res) => {
  const personal = await personalService.getById(req.params.id);
  sendSuccess(res, personal);
});

/**
 * POST /api/personal/propio - Crear personal propio
 */
export const createPropio = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, req.body);
  const personal = await personalService.createPropio(req.body, userId);
  sendSuccess(res, personal, 201);
});

/**
 * POST /api/personal/terceros - Crear personal terceros
 */
export const createTerceros = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, req.body);
  const personal = await personalService.createTerceros(req.body, userId);
  sendSuccess(res, personal, 201);
});

/**
 * PUT /api/personal/:id - Actualizar personal
 */
export const update = asyncHandler(async (req, res) => {
  const personal = await personalService.update(req.params.id, req.body);
  sendSuccess(res, personal);
});

/**
 * DELETE /api/personal/:id - Eliminar personal
 */
export const remove = asyncHandler(async (req, res) => {
  const result = await personalService.delete(req.params.id);
  sendSuccess(res, result);
});

/**
 * GET /api/personal/summary/totals - Obtener resumen de personal
 */
export const getSummary = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const summary = await personalService.getSummary(userId);
  sendSuccess(res, summary);
});
