import inmueblesService from "../../services/inmuebles.service.js";
import { sendSuccess } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getInmueblesController = asyncHandler(async (req, res) => {
  const inmuebles = await inmueblesService.getAll();
  sendSuccess(res, inmuebles);
});

export const createInmueblesController = asyncHandler(async (req, res) => {
  const inmueble = await inmueblesService.create(req.body);
  sendSuccess(res, inmueble, 201);
});

export const updateInmueblesController = asyncHandler(async (req, res) => {
  const inmueble = await inmueblesService.update(req.params.id, req.body);
  sendSuccess(res, inmueble);
});

export const deleteInmueblesController = asyncHandler(async (req, res) => {
  const result = await inmueblesService.delete(req.params.id);
  sendSuccess(res, result);
});