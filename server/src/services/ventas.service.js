import Venta from "../models/VentaModel.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * VentasService - Lógica de negocio para gestión de ventas
 */
class VentasService {
  /**
   * Obtener todas las ventas
   */
  async getAll(userId = null) {
    const filters = {};
    if (userId) filters.userId = userId;
    return Venta.find(filters).sort({ fecha: -1 });
  }

  /**
   * Obtener venta por ID
   */
  async getById(id) {
    const venta = await Venta.findById(id);
    if (!venta) {
      throw new NotFoundError("Venta", id);
    }
    return venta;
  }

  /**
   * Crear nueva venta
   */
  async create(data, userId = null) {
    // Validaciones
    if (!data.montoUSD || data.montoUSD < 0) {
      throw new ValidationError("El monto debe ser mayor o igual a 0");
    }

    const ventaData = {
      ...data,
      userId: userId || data.userId,
      montoUSD: data.montoUSD,
      descripcion: data.descripcion || "",
      periodo: data.periodo || "",
      fecha: data.fecha || new Date(),
    };

    const venta = new Venta(ventaData);
    return venta.save();
  }

  /**
   * Actualizar venta
   */
  async update(id, data) {
    // Validar que existe
    await this.getById(id);

    // Validaciones
    if (data.montoUSD !== undefined && data.montoUSD < 0) {
      throw new ValidationError("El monto debe ser mayor o igual a 0");
    }

    const venta = await Venta.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return venta;
  }

  /**
   * Eliminar venta
   */
  async delete(id) {
    const venta = await Venta.findByIdAndDelete(id);
    if (!venta) {
      throw new NotFoundError("Venta", id);
    }
    return { deleted: true, id };
  }

  /**
   * Obtener resumen de ventas
   */
  async getSummary(userId = null) {
    const match = {};
    if (userId) match.userId = userId;

    const summary = await Venta.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalVentas: { $sum: "$montoUSD" },
          count: { $sum: 1 },
          promedio: { $avg: "$montoUSD" },
        }
      }
    ]);

    return summary[0] || { totalVentas: 0, count: 0, promedio: 0 };
  }

  /**
   * Obtener ventas por período
   */
  async getByPeriodo(periodo, userId = null) {
    const filters = { periodo };
    if (userId) filters.userId = userId;
    return Venta.find(filters).sort({ fecha: -1 });
  }
}

export default new VentasService();
