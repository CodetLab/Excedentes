import capitalRepository from "../repositories/capital.repository.js";
import { normalizeCapitalPayload } from "../utils/requestSanitizer.js";
import { validateCapitalPayload } from "../utils/validators.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

// Tipos válidos de capital
const TIPOS_VALIDOS = [
  "TIERRAS",
  "INMUEBLES",
  "MUEBLES",
  "VEHICULOS", 
  "HERRAMIENTAS",
  "STOCK"
];

/**
 * CapitalService - Lógica de negocio para gestión de capital
 */
class CapitalService {
  /**
   * Validar tipo de capital
   */
  validateTipo(tipo) {
    const tipoUpper = tipo.toUpperCase();
    if (!TIPOS_VALIDOS.includes(tipoUpper)) {
      throw new ValidationError(`Tipo inválido. Usar: ${TIPOS_VALIDOS.join(", ")}`);
    }
    return tipoUpper;
  }

  /**
   * Obtener todos los items de capital
   * 🔴 FIX: Ahora requiere companyId como parámetro directo
   */
  async getAll(companyId, tipo = null) {
    console.log(`[CAPITAL] getAll companyId=${companyId}, tipo=${tipo}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido en service");
    }

    const query = { companyId, tipo: { $in: TIPOS_VALIDOS } };
    if (tipo) {
      const tipoUpper = this.validateTipo(tipo);
      query.tipo = tipoUpper;
    }
    
    return capitalRepository.find(query);
  }

  /**
   * Obtener items por tipo
   * 🔴 FIX: Validar companyId obligatorio
   */
  async getByTipo(tipo, companyId) {
    console.log(`[CAPITAL] getByTipo tipo=${tipo}, companyId=${companyId}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    const tipoUpper = this.validateTipo(tipo);
    return capitalRepository.findByTipo(tipoUpper, companyId);
  }

  /**
   * Obtener item por ID
   */
  async getById(id) {
    const item = await capitalRepository.findById(id);
    if (!item) {
      throw new NotFoundError("Item de capital", id);
    }
    return item;
  }

  /**
   * Crear nuevo item de capital
   * 🔴 FIX: Validar companyId primero
   */
  async create(tipo, data, companyId) {
    console.log(`[CAPITAL] create tipo=${tipo}, companyId=${companyId}`);
    
    const tipoUpper = this.validateTipo(tipo);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }
    
    // Normalizar y validar
    const normalizedData = normalizeCapitalPayload(data, tipoUpper);
    const errors = validateCapitalPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }
    
    return capitalRepository.create({
      ...normalizedData,
      tipo: tipoUpper,
      companyId,
    });
  }

  /**
   * Actualizar item de capital
   */
  async update(id, data) {
    const existing = await this.getById(id);
    
    const normalizedData = normalizeCapitalPayload(data, existing.tipo);
    const errors = validateCapitalPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }
    
    return capitalRepository.update(id, normalizedData);
  }

  /**
   * Eliminar item de capital
   */
  async delete(id) {
    const item = await capitalRepository.delete(id);
    if (!item) {
      throw new NotFoundError("Item de capital", id);
    }
    return { deleted: true, id };
  }

  /**
   * Obtener resumen agregado por tipo
   * 🔴 FIX: companyId es obligatorio
   */
  async getSummary(companyId) {
    console.log(`[CAPITAL] getSummary companyId=${companyId}`);
    
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    const match = { companyId, tipo: { $in: TIPOS_VALIDOS } };
    
    const summary = await capitalRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          count: { $sum: 1 },
          totalValorUSD: { $sum: "$valorUSD" },
          totalCostoUSD: { $sum: "$costoUSD" },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totals = summary.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.count,
      totalValorUSD: acc.totalValorUSD + item.totalValorUSD,
      totalCostoUSD: acc.totalCostoUSD + item.totalCostoUSD,
    }), { totalItems: 0, totalValorUSD: 0, totalCostoUSD: 0 });
    
    return { byTipo: summary, totals };
  }
}

export default new CapitalService();
