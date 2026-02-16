import capitalRepository from "../repositories/capital.repository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * GananciasService - Lógica de negocio para Ganancias
 * Las ganancias son un tipo especial de Capital (suele haber 1 registro por usuario)
 */
class GananciasService {
  /**
   * Obtener ganancias del usuario
   * FIX: companyId OBLIGATORIO
   */
  async get(companyId) {
    console.log(`[GANANCIAS] get companyId=${companyId}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    const items = await capitalRepository.find({ tipo: "GANANCIAS", companyId });

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
   * FIX: companyId OBLIGATORIO
   */
  async createOrUpdate(data, companyId) {
    console.log(`[GANANCIAS] createOrUpdate companyId=${companyId}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    // Buscar registro existente
    const existing = await capitalRepository.findOne({ 
      tipo: "GANANCIAS",
      companyId 
    });

    // Preparar datos
    const gananciaData = {
      tipo: "GANANCIAS",
      companyId,
      nombre: "Ganancias",
      mes: data.mes || new Date().getMonth() + 1,
      anio: data.anio || new Date().getFullYear(),
      totalGanancias: data.totalGanancias || 0,
      desglose: data.desglose || {
        gananciaCapital: 0,
        gananciaPersonal: 0
      },
      notas: data.notas || "",
      valorUSD: data.totalGanancias || 0,
      costoUSD: 0,
    };

    if (existing) {
      return capitalRepository.update(existing._id, gananciaData);
    } else {
      return capitalRepository.create(gananciaData);
    }
  }

  /**
   * Eliminar ganancias
   */
  async delete(companyId) {
    const existing = await capitalRepository.findOne({ 
      tipo: "GANANCIAS",
      companyId 
    });

    if (!existing) {
      throw new NotFoundError("Ganancias", companyId);
    }

    return capitalRepository.delete(existing._id);
  }

  /**
   * Obtener total de ganancias
   * FIX: companyId OBLIGATORIO
   */
  async getTotal(companyId) {
    console.log(`[GANANCIAS] getTotal companyId=${companyId}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    const ganancias = await this.get(companyId);
    return ganancias.totalGanancias || 0;
  }
}

export default new GananciasService();
