import personalService from "../../services/personal.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

/**
 * GET /api/personal/propio - Obtener personal propio
 */
export const getPropio = asyncHandler(async (req, res) => {
  console.log("[PERSONAL.getPropio] START", {
    authHeader: req.headers.authorization ? req.headers.authorization.substring(0, 20) : "MISSING",
    userId: req.userId,
    companyId: req.companyId,
    role: req.role
  });

  const companyId = req.companyId;
  if (!companyId) {
    console.error("[PERSONAL.getPropio] BLOCKED - companyId is null/undefined");
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  
  console.log("[PERSONAL.getPropio] Query service with companyId=", companyId);
  const personal = await personalService.getPropio(companyId);
  console.log("[PERSONAL.getPropio] SUCCESS", { itemsCount: personal.length });
  sendSuccess(res, personal);
});

/**
 * GET /api/personal/terceros - Obtener personal terceros
 */
export const getTerceros = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const personal = await personalService.getTerceros(companyId);
  sendSuccess(res, personal);
});

/**
 * GET /api/personal - Obtener todo el personal
 */
export const getAll = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const personal = await personalService.getAll(companyId);
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
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const personal = await personalService.createPropio(req.body, companyId);
  sendSuccess(res, personal, 201);
});

/**
 * POST /api/personal/terceros - Crear personal terceros
 */
export const createTerceros = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const personal = await personalService.createTerceros(req.body, companyId);
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
  const companyId = req.companyId;
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const summary = await personalService.getSummary(companyId);
  sendSuccess(res, summary);
});
