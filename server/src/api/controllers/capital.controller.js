import capitalService from "../../services/capital.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { getOrCreateUserId } from "../../utils/requestSanitizer.js";

// GET /api/capital - Obtener todo el capital del usuario
export const getAll = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const { tipo } = req.query;
  const items = await capitalService.getAll({ userId, tipo });
  sendSuccess(res, items);
});

// GET /api/capital/:tipo - Obtener por tipo específico
export const getByTipo = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const items = await capitalService.getByTipo(req.params.tipo, userId);
  sendSuccess(res, items);
});

// GET /api/capital/item/:id - Obtener un item específico
export const getById = asyncHandler(async (req, res) => {
  const item = await capitalService.getById(req.params.id);
  sendSuccess(res, item);
});

// POST /api/capital/:tipo - Crear nuevo item de capital
export const create = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, req.body);
  const item = await capitalService.create(req.params.tipo, req.body, userId);
  sendSuccess(res, item, 201);
});

// PUT /api/capital/item/:id - Actualizar item
export const update = asyncHandler(async (req, res) => {
  const item = await capitalService.update(req.params.id, req.body);
  sendSuccess(res, item);
});

// DELETE /api/capital/item/:id - Eliminar item
export const remove = asyncHandler(async (req, res) => {
  const result = await capitalService.delete(req.params.id);
  sendSuccess(res, result);
});

// GET /api/capital/summary - Resumen agregado por tipo
export const getSummary = asyncHandler(async (req, res) => {
  const userId = getOrCreateUserId(req, {});
  const summary = await capitalService.getSummary(userId);
  sendSuccess(res, summary);
});
