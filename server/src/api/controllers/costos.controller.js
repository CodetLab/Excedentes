import {
  getCostos as getCostosService,
  createCosto as createCostoService,
  updateCosto as updateCostoService,
  deleteCosto as deleteCostoService,
} from "../../services/costos.service.js";

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

export const getCostos = async (req, res) => {
  try {
    const costos = await getCostosService();
    res.json(costos);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createCosto = async (req, res) => {
  try {
    const nuevoCosto = await createCostoService(req.body);
    res.status(201).json(nuevoCosto);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateCosto = async (req, res) => {
  try {
    const costo = await updateCostoService(req.params.id, req.body);
    res.json(costo);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteCosto = async (req, res) => {
  try {
    await deleteCostoService(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};

