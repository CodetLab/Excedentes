import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} from "../../services/productos.service.js";

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

export const getProductosController = async (req, res) => {
  try {
    const productos = await getProductos();
    res.json(productos);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const getProductoByIdController = async (req, res) => {
  try {
    const producto = await getProductoById(req.params.id);
    res.json(producto);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const createProductoController = async (req, res) => {
  try {
    const producto = await createProducto(req.body);
    res.status(201).json(producto);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const updateProductoController = async (req, res) => {
  try {
    const producto = await updateProducto(req.params.id, req.body);
    res.json(producto);
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const deleteProductoController = async (req, res) => {
  try {
    await deleteProducto(req.params.id);
    res.status(204).send();
  } catch (error) {
    handleControllerError(res, error);
  }
};
