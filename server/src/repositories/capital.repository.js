import Capital from "../models/CapitalModel.js";

/**
 * Repository para Capital - maneja acceso a datos
 * Soporta todos los tipos de capital (TIERRAS, MUEBLES, PERSONAL_PROPIO, etc.)
 */
class CapitalRepository {
  /**
   * Buscar por filtros
   */
  async find(filters = {}, sort = { createdAt: -1 }) {
    return Capital.find(filters).sort(sort);
  }

  /**
   * Buscar uno por filtros
   */
  async findOne(filters) {
    return Capital.findOne(filters);
  }

  /**
   * Buscar por ID
   */
  async findById(id) {
    return Capital.findById(id);
  }

  /**
   * Crear nuevo item
   */
  async create(data) {
    const item = new Capital(data);
    return item.save();
  }

  /**
   * Actualizar item
   */
  async update(id, data) {
    return Capital.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  /**
   * Eliminar item
   */
  async delete(id) {
    return Capital.findByIdAndDelete(id);
  }

  /**
   * Contar documentos por filtros
   */
  async count(filters) {
    return Capital.countDocuments(filters);
  }

  /**
   * Agregación
   */
  async aggregate(pipeline) {
    return Capital.aggregate(pipeline);
  }

  /**
   * Obtener items por tipo
   */
  async findByTipo(tipo, companyId = null) {
    const filters = { tipo };
    if (companyId) filters.companyId = companyId;
    return this.find(filters);
  }

  /**
   * Obtener items activos por tipo
   */
  async findActiveByTipo(tipo, companyId = null) {
    const filters = { tipo, activo: true };
    if (companyId) filters.companyId = companyId;
    return this.find(filters);
  }
}

export default new CapitalRepository();
