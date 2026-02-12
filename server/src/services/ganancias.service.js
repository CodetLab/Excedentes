import capitalRepository from "../repositories/capital.repository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * GananciasService - Lógica de negocio para Ganancias
 * Las ganancias son un tipo especial de Capital (suele haber 1 registro por usuario)
 */
class GananciasService {
  /**
   * Obtener ganancias del usuario
   * Retorna el primer registro o estructura vacía
   */
  async get(userId = null) {
    const filters = { tipo: "GANANCIAS" };
    if (userId) filters.userId = userId;

    const items = await capitalRepository.find(filters);

    if (items.length > 0) {
      return items[0];
    }

    // Retornar estructura vacía si no existe
    return {
      tipo: "GANANCIAS",
      mes: new Date().getMonth() + 1,
      anio: new Date().getFullYear(),
      totalGanancias: 0,
      desglose: {
        gananciaCapital: 0,
        gananciaPersonal: 0
      },
      notas: ""
    };
  }

  /**
   * Crear o actualizar ganancias
   * Solo permite un registro por usuario
   */
  async createOrUpdate(data, userId) {
    if (!userId) {
      throw new ValidationError("userId es requerido");
    }

    // Buscar registro existente
    const existing = await capitalRepository.findOne({ 
      tipo: "GANANCIAS",
      userId 
    });

    // Preparar datos
    const gananciaData = {
      tipo: "GANANCIAS",
      userId,
      nombre: "Ganancias",
      mes: data.mes || new Date().getMonth() + 1,
      anio: data.anio || new Date().getFullYear(),
      totalGanancias: data.totalGanancias || 0,
      desglose: data.desglose || {
        gananciaCapital: 0,
        gananciaPersonal: 0
      },
      notas: data.notas || "",
      valorUSD: data.totalGanancias || 0, // Para compatibilidad con Capital
      costoUSD: 0,
    };

    if (existing) {
      // Actualizar existente
      return capitalRepository.update(existing._id, gananciaData);
    } else {
      // Crear nuevo
      return capitalRepository.create(gananciaData);
    }
  }

  /**
   * Eliminar ganancias
   */
  async delete(userId) {
    const existing = await capitalRepository.findOne({ 
      tipo: "GANANCIAS",
      userId 
    });

    if (!existing) {
      throw new NotFoundError("Ganancias", userId);
    }

    return capitalRepository.delete(existing._id);
  }

  /**
   * Obtener total de ganancias
   */
  async getTotal(userId = null) {
    const ganancias = await this.get(userId);
    return ganancias.totalGanancias || 0;
  }
}

export default new GananciasService();
