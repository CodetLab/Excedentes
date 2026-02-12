import ventasService from "../../services/ventas.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getVentasController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const ventas = await ventasService.getAll(userId);
  sendSuccess(res, ventas);
});

export const getVentaByIdController = asyncHandler(async (req, res) => {
  const venta = await ventasService.getById(req.params.id);
  sendSuccess(res, venta);
});

export const createVentaController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const venta = await ventasService.create(req.body, userId);
  sendSuccess(res, venta, 201);
});

export const updateVentaController = asyncHandler(async (req, res) => {
  const venta = await ventasService.update(req.params.id, req.body);
  sendSuccess(res, venta);
});

export const deleteVentaController = asyncHandler(async (req, res) => {
  const result = await ventasService.delete(req.params.id);
  sendSuccess(res, result);
});

export const getSummaryController = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const summary = await ventasService.getSummary(userId);
  sendSuccess(res, summary);
});
