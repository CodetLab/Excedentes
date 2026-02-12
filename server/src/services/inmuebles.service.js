import Inmueble from "../models/InmueblesModel.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * InmueblesService - Lógica de negocio para Inmuebles
 */
class InmueblesService {
  /**
   * Obtener todos los inmuebles
   */
  async getAll() {
    return Inmueble.find().sort({ item: 1 });
  }

  /**
   * Obtener inmueble por ID
   */
  async getById(id) {
    const inmueble = await Inmueble.findById(id);
    if (!inmueble) {
      throw new NotFoundError("Inmueble", id);
    }
    return inmueble;
  }

  /**
   * Crear nuevo inmueble
   */
  async create(data) {
    // Validaciones básicas
    if (!data.Designacion || !data.Descripcion || !data.Identificacion) {
      throw new ValidationError("Campos requeridos: Designacion, Descripcion, Identificacion");
    }

    if (data.ValorNuevo < 0 || data.ValorActual < 0 || data.Afectado < 0) {
      throw new ValidationError("Los valores no pueden ser negativos");
    }

    const inmueble = new Inmueble(data);
    return inmueble.save();
  }

  /**
   * Actualizar inmueble
   */
  async update(id, data) {
    // Validaciones básicas
    if (data.ValorNuevo !== undefined && data.ValorNuevo < 0) {
      throw new ValidationError("ValorNuevo no puede ser negativo");
    }
    if (data.ValorActual !== undefined && data.ValorActual < 0) {
      throw new ValidationError("ValorActual no puede ser negativo");
    }
    if (data.Afectado !== undefined && data.Afectado < 0) {
      throw new ValidationError("Afectado no puede ser negativo");
    }

    const inmueble = await Inmueble.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!inmueble) {
      throw new NotFoundError("Inmueble", id);
    }

    return inmueble;
  }

  /**
   * Eliminar inmueble
   */
  async delete(id) {
    const inmueble = await Inmueble.findByIdAndDelete(id);
    if (!inmueble) {
      throw new NotFoundError("Inmueble", id);
    }
    return { deleted: true, id };
  }

  /**
   * Obtener resumen de inmuebles
   */
  async getSummary() {
    const summary = await Inmueble.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalValorNuevo: { $sum: "$ValorNuevo" },
          totalValorActual: { $sum: "$ValorActual" },
          totalAfectado: { $sum: "$Afectado" },
        }
      }
    ]);

    return summary[0] || { 
      count: 0, 
      totalValorNuevo: 0, 
      totalValorActual: 0, 
      totalAfectado: 0 
    };
  }
}

export default new InmueblesService();
