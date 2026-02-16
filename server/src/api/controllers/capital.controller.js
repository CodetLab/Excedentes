import capitalService from "../../services/capital.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

// GET /api/capital - Obtener todo el capital del usuario
export const getAll = asyncHandler(async (req, res) => {
  console.log("[CAPITAL.getAll] START", {
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) : "MISSING",
    userId: req.userId,
    companyId: req.companyId,
    role: req.role,
    queryParams: req.query
  });

  const companyId = req.companyId;
  
  if (!companyId) {
    console.error("[CAPITAL.getAll] BLOCKED - companyId is null/undefined");
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  
  console.log("[CAPITAL.getAll] Query service with companyId=", companyId);
  const { tipo } = req.query;
  const items = await capitalService.getAll(companyId, tipo);
  console.log("[CAPITAL.getAll] SUCCESS", { itemsCount: items.length });
  sendSuccess(res, items);
});

// GET /api/capital/:tipo - Obtener por tipo específico
export const getByTipo = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  console.log(`[CONTROLLER-CAPITAL] getByTipo tipo=${req.params.tipo}, companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  
  const items = await capitalService.getByTipo(req.params.tipo, companyId);
  sendSuccess(res, items);
});

// GET /api/capital/item/:id - Obtener un item específico
export const getById = asyncHandler(async (req, res) => {
  const item = await capitalService.getById(req.params.id);
  sendSuccess(res, item);
});

// POST /api/capital/:tipo - Crear nuevo item de capital
export const create = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const item = await capitalService.create(req.params.tipo, req.body, companyId);
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
  const companyId = req.companyId;
  console.log(`[CONTROLLER-CAPITAL] getSummary, companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const summary = await capitalService.getSummary(companyId);
  sendSuccess(res, summary);
});
