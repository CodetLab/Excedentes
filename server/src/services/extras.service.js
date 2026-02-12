import capitalRepository from "../repositories/capital.repository.js";
import { normalizeExtrasPayload } from "../utils/requestSanitizer.js";
import { validateExtrasPayload } from "../utils/validators.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * ExtrasService - Lógica de negocio para Extras (intereses, etc.)
 * Los extras son un tipo especial de Capital
 */
class ExtrasService {
  /**
   * Obtener todos los extras
   */
  async getAll(userId = null) {
    return capitalRepository.findByTipo("EXTRAS", userId);
  }

  /**
   * Obtener extra por ID
   */
  async getById(id) {
    const item = await capitalRepository.findOne({ 
      _id: id,
      tipo: "EXTRAS" 
    });
    if (!item) {
      throw new NotFoundError("Extra", id);
    }
    return item;
  }

  /**
   * Crear nuevo extra
   */
  async create(data, userId) {
    if (!userId) {
      throw new ValidationError("userId es requerido");
    }

    const normalizedData = normalizeExtrasPayload(data);
    const errors = validateExtrasPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }

    // Calcular montoAnualUSD si no viene
    if (normalizedData.montoMensualUSD && !normalizedData.montoAnualUSD) {
      normalizedData.montoAnualUSD = normalizedData.montoMensualUSD * 12;
    }

    return capitalRepository.create({
      ...normalizedData,
      tipo: "EXTRAS",
      userId,
    });
  }

  /**
   * Actualizar extra
   */
  async update(id, data) {
    const existing = await this.getById(id);

    const normalizedData = normalizeExtrasPayload(data);
    const errors = validateExtrasPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }

    // Calcular montoAnualUSD si no viene
    if (normalizedData.montoMensualUSD && !normalizedData.montoAnualUSD) {
      normalizedData.montoAnualUSD = normalizedData.montoMensualUSD * 12;
    }

    return capitalRepository.update(id, normalizedData);
  }

  /**
   * Eliminar extra
   */
  async delete(id) {
    const item = await capitalRepository.delete(id);
    if (!item || item.tipo !== "EXTRAS") {
      throw new NotFoundError("Extra", id);
    }
    return { deleted: true, id };
  }

  /**
   * Obtener resumen de extras
   */
  async getSummary(userId = null) {
    const match = { tipo: "EXTRAS" };
    if (userId) match.userId = userId;

    const summary = await capitalRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalMontoMensual: { $sum: "$montoMensualUSD" },
          totalMontoAnual: { $sum: "$montoAnualUSD" },
          count: { $sum: 1 }
        }
      }
    ]);

    return summary[0] || { totalMontoMensual: 0, totalMontoAnual: 0, count: 0 };
  }
}

export default new ExtrasService();
