import capitalRepository from "../repositories/capital.repository.js";
import { normalizePersonalPayload } from "../utils/requestSanitizer.js";
import { validatePersonalPayload } from "../utils/validators.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * PersonalService - Lógica de negocio para Personal (Propio y Terceros)
 * El personal son tipos especiales de Capital: PERSONAL_PROPIO, PERSONAL_TERCEROS
 */
class PersonalService {
  /**
   * Obtener personal propio
   * 🔴 FIX: companyId OBLIGATORIO
   */
  async getPropio(companyId) {
    console.log(`[PERSONAL] getPropio companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    return capitalRepository.findByTipo("PERSONAL_PROPIO", companyId);
  }

  /**
   * Obtener personal terceros
   * 🔴 FIX: companyId OBLIGATORIO
   */
  async getTerceros(companyId) {
    console.log(`[PERSONAL] getTerceros companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    return capitalRepository.findByTipo("PERSONAL_TERCEROS", companyId);
  }

  /**
   * Obtener todo el personal
   * 🔴 FIX: companyId OBLIGATORIO
   */
  async getAll(companyId) {
    console.log(`[PERSONAL] getAll companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    
    return capitalRepository.find({ 
      companyId,
      tipo: { $in: ["PERSONAL_PROPIO", "PERSONAL_TERCEROS"] }
    });
  }

  /**
   * Obtener item por ID
   */
  async getById(id) {
    const item = await capitalRepository.findOne({
      _id: id,
      tipo: { $in: ["PERSONAL_PROPIO", "PERSONAL_TERCEROS"] }
    });
    if (!item) {
      throw new NotFoundError("Personal", id);
    }
    return item;
  }

  /**
   * Crear personal propio
   */
  async createPropio(data, companyId) {
    return this._create(data, "PERSONAL_PROPIO", companyId);
  }

  /**
   * Crear personal terceros
   */
  async createTerceros(data, companyId) {
    return this._create(data, "PERSONAL_TERCEROS", companyId);
  }

  /**
   * Método privado para crear personal
   */
  async _create(data, tipoPersonal, companyId) {
    if (!companyId) {
      throw new ValidationError("companyId es requerido");
    }

    const normalizedData = normalizePersonalPayload(data, tipoPersonal);
    const errors = validatePersonalPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }

    // Calcular costo total si aplica
    if (normalizedData.salarioMensualUSD !== undefined) {
      normalizedData.costoTotalMensualUSD = 
        (normalizedData.salarioMensualUSD || 0) + (normalizedData.cargosSocialesUSD || 0);
    }

    return capitalRepository.create({
      ...normalizedData,
      tipo: tipoPersonal,
      companyId,
    });
  }

  /**
   * Actualizar personal
   */
  async update(id, data) {
    const existing = await this.getById(id);

    const normalizedData = normalizePersonalPayload(data, existing.tipo);
    const errors = validatePersonalPayload(normalizedData);
    if (errors) {
      throw new ValidationError(errors);
    }

    // Calcular costo total si aplica
    if (normalizedData.salarioMensualUSD !== undefined) {
      normalizedData.costoTotalMensualUSD = 
        (normalizedData.salarioMensualUSD || 0) + (normalizedData.cargosSocialesUSD || 0);
    }

    return capitalRepository.update(id, normalizedData);
  }

  /**
   * Eliminar personal
   */
  async delete(id) {
    const item = await capitalRepository.delete(id);
    if (!item || !["PERSONAL_PROPIO", "PERSONAL_TERCEROS"].includes(item.tipo)) {
      throw new NotFoundError("Personal", id);
    }
    return { deleted: true, id };
  }

  /**
   * Obtener resumen de costos de personal
   */
  async getSummary(companyId = null) {
    const match = { 
      tipo: { $in: ["PERSONAL_PROPIO", "PERSONAL_TERCEROS"] },
      activo: true
    };
    if (companyId) match.companyId = companyId;

    const summary = await capitalRepository.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          totalSalarios: { $sum: "$salarioMensualUSD" },
          totalCargos: { $sum: "$cargosSocialesUSD" },
          totalCosto: { $sum: "$costoTotalMensualUSD" },
          count: { $sum: 1 }
        }
      }
    ]);

    const totals = summary.reduce((acc, item) => ({
      totalSalarios: acc.totalSalarios + item.totalSalarios,
      totalCargos: acc.totalCargos + item.totalCargos,
      totalCosto: acc.totalCosto + item.totalCosto,
      totalPersonal: acc.totalPersonal + item.count,
    }), { totalSalarios: 0, totalCargos: 0, totalCosto: 0, totalPersonal: 0 });

    return { byTipo: summary, totals };
  }
}

export default new PersonalService();
