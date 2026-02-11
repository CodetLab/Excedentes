import Producto from "../../../models/ProductoModel.js";
import { ServiceError } from "../../../utils/serviceError.js";

export const getProductos = async () => {
  try {
    return await Producto.find();
  } catch (error) {
    throw new ServiceError("Error al obtener productos", 500, error);
  }
};

export const getProductoById = async (id) => {
  try {
    const producto = await Producto.findById(id);

    if (!producto) {
      throw new ServiceError("Producto no encontrado", 404);
    }

    return producto;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al obtener producto", 500, error);
  }
};

export const createProducto = async (data) => {
  try {
    const nuevoProducto = new Producto(data);
    await nuevoProducto.save();
    return nuevoProducto;
  } catch (error) {
    if (error.name === "ValidationError") {
      throw new ServiceError("Datos invalidos", 400, error.errors);
    }

    throw new ServiceError("Error al crear producto", 500, error);
  }
};

export const updateProducto = async (id, data) => {
  try {
    const producto = await Producto.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!producto) {
      throw new ServiceError("Producto no encontrado", 404);
    }

    return producto;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    if (error.name === "ValidationError") {
      throw new ServiceError("Datos invalidos", 400, error.errors);
    }

    throw new ServiceError("Error al actualizar producto", 500, error);
  }
};

export const deleteProducto = async (id) => {
  try {
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      throw new ServiceError("Producto no encontrado", 404);
    }

    return producto;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al eliminar producto", 500, error);
  }
};
