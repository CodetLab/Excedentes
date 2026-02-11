import {
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
} from "../../services/ventas.service.js";

const handleControllerError = (res, error) => {
  const status = error.statusCode || 500;
  const payload = {
    message: error.message || "Error interno del servidor",
  };

  if (error.details) {
    payload.errors = error.details;
  }

  res.status(status).json(payload);
};

export const getVentasController = async (req, res) => {
  try {
    const ventas = await getVentas();
    res.json(ventas);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getVentaByIdController = async (req, res) => {
  try {
    const venta = await getVentaById(req.params.id);
    res.json(venta);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createVentaController = async (req, res) => {
  try {
    const venta = await createVenta(req.body);
    res.status(201).json(venta);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateVentaController = async (req, res) => {
  try {
    const venta = await updateVenta(req.params.id, req.body);
    res.json(venta);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteVentaController = async (req, res) => {
  try {
    await deleteVenta(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};
