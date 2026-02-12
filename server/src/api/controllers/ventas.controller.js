import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
} from "../../services/ventas.service.js";
import response from "../../utils/responseHelper.js";

export const getVentasController = async (req, res) => {
  try {
    const ventas = await getVentas();
    return response.success(res, ventas);
  } catch (error) {
    return response.serverError(res, error);
  }
};

export const getVentaByIdController = async (req, res) => {
  try {
    const venta = await getVentaById(req.params.id);
    if (!venta) return response.notFound(res, "Venta");
    return response.success(res, venta);
  } catch (error) {
    return response.serverError(res, error);
  }
};

export const createVentaController = async (req, res) => {
  try {
    const venta = await createVenta(req.body);
    return response.created(res, venta);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

export const updateVentaController = async (req, res) => {
  try {
    const venta = await updateVenta(req.params.id, req.body);
    if (!venta) return response.notFound(res, "Venta");
    return response.success(res, venta);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

export const deleteVentaController = async (req, res) => {
  try {
    const result = await deleteVenta(req.params.id);
    if (!result) return response.notFound(res, "Venta");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
};
