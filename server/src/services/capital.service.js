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
   */
  async getAll(filters = {}) {
    const { userId, tipo } = filters;
    
    const query = { tipo: { $in: TIPOS_VALIDOS } };
    if (userId) query.userId = userId;
    if (tipo) {
      const tipoUpper = this.validateTipo(tipo);
      query.tipo = tipoUpper;
    }
    
    return capitalRepository.find(query);
  }

  /**
   * Obtener items por tipo
   */
  async getByTipo(tipo, userId = null) {
    const tipoUpper = this.validateTipo(tipo);
    return capitalRepository.findByTipo(tipoUpper, userId);
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
   */
  async create(tipo, data, userId) {
    const tipoUpper = this.validateTipo(tipo);
    
    if (!userId) {
      throw new ValidationError("userId es requerido");
    }
    
    // Normalizar y validar
    const normalizedData = normalizeCapitalPayload(data, tipoUpper);
    const errors = validateCapitalPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }
    
    const item = new Capital({
      ...normalizedData,
      tipo: tipoUpper,
      userId,
    return capitalRepository.create({
      ...normalizedData,
      tipo: tipoUpper,
      userId,
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
    const item = await capitalRepository.d
  }

  /**
   * Obtener resumen agregado por tipo
   */
  async getSummary(userId = null) {
    const match = { tipo: { $in: TIPOS_VALIDOS } };
    if (userId) match.userId = userId;
    
    const summary = await Capital.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          count: { $sum: 1 },
          totalValorUSD: { $sum: "$valorUSD" },
          totalCostoUSD: { $sum: "$costoUSD" },
        }capitalRepository
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
