import {
  getCostos as getCostosService,
  createCosto as createCostoService,
  updateCosto as updateCostoService,
  deleteCosto as deleteCostoService,
} from "../../services/costos.service.js";
import response from "../../utils/responseHelper.js";

export const getCostos = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return response.error(res, "Acceso denegado: companyId requerido", 403);
    }
    const costos = await getCostosService(companyId);
    return response.success(res, costos);
  } catch (error) {
    return response.serverError(res, error);
  }
};

export const createCosto = async (req, res) => {
  try {
    const companyId = req.companyId;
    if (!companyId) {
      return response.error(res, "Acceso denegado: companyId requerido", 403);
    }
    const nuevoCosto = await createCostoService(req.body, companyId);
    return response.created(res, nuevoCosto);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

export const updateCosto = async (req, res) => {
  try {
    const costo = await updateCostoService(req.params.id, req.body);
    if (!costo) return response.notFound(res, "Costo");
    return response.success(res, costo);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

export const deleteCosto = async (req, res) => {
  try {
    const result = await deleteCostoService(req.params.id);
    if (!result) return response.notFound(res, "Costo");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
};

