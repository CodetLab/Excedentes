import Costo from "../../../models/CostoModel.js";
import { ServiceError } from "../../../utils/serviceError.js";

export const getCostos = async () => {
  try {
    return await Costo.find();
  } catch (error) {
    throw new ServiceError("Error al obtener costos", 500, error);
  }
};

export const createCosto = async (data) => {
  try {
    const nuevoCosto = new Costo(data);
    await nuevoCosto.save();
    return nuevoCosto;
  } catch (error) {
    if (error.name === "ValidationError") {
      throw new ServiceError("Datos invalidos", 400, error.errors);
    }

    throw new ServiceError("Error al crear costo", 500, error);
  }
};

export const updateCosto = async (id, data) => {
  try {
    const costo = await Costo.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!costo) {
      throw new ServiceError("Costo no encontrado", 404);
    }

    return costo;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    if (error.name === "ValidationError") {
      throw new ServiceError("Datos invalidos", 400, error.errors);
    }

    throw new ServiceError("Error al actualizar costo", 500, error);
  }
};

export const deleteCosto = async (id) => {
  try {
    const costo = await Costo.findByIdAndDelete(id);

    if (!costo) {
      throw new ServiceError("Costo no encontrado", 404);
    }

    return costo;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al eliminar costo", 500, error);
  }
};
