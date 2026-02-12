// ==============================================
// CRUD SERVICE - Operaciones genéricas reutilizables
// ==============================================

import Capital from "../models/CapitalModel.js";
import response from "../utils/responseHelper.js";
import { getOrCreateUserId } from "../utils/requestSanitizer.js";

/**
 * Obtiene todos los items de un tipo específico
 */
export const getByTipo = async (req, res, tipo) => {
  try {
    const filter = { tipo: tipo.toUpperCase() };
    const userId = getOrCreateUserId(req, {});
    if (userId) filter.userId = userId;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    return response.success(res, items);
  } catch (error) {
    return response.serverError(res, error);
  }
};

/**
 * Obtiene un item por ID
 */
export const getById = async (req, res) => {
  try {
    const item = await Capital.findById(req.params.id);
    if (!item) return response.notFound(res, "Item");
    return response.success(res, item);
  } catch (error) {
    return response.serverError(res, error);
  }
};

/**
 * Crea un nuevo item
 */
export const createItem = async (req, res, tipo, normalizedData) => {
  try {
    const userId = getOrCreateUserId(req, req.body);
    if (!userId) {
      return response.error(res, "userId es requerido", 400);
    }
    
    const item = new Capital({
      ...normalizedData,
      tipo: tipo.toUpperCase(),
      userId,
    });
    
    await item.save();
    return response.created(res, item);
  } catch (error) {
    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

/**
 * Actualiza un item existente
 */
export const updateItem = async (req, res, normalizedData) => {
  try {
    const item = await Capital.findByIdAndUpdate(
      req.params.id,
      { ...normalizedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!item) return response.notFound(res, "Item");
    return response.success(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
};

/**
 * Elimina un item
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return response.notFound(res, "Item");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
};

/**
 * Obtiene resumen agregado por tipo
 */
export const getSummaryByTipos = async (req, res, tipos) => {
  try {
    const userId = getOrCreateUserId(req, {});
    const match = { tipo: { $in: tipos.map(t => t.toUpperCase()) } };
    if (userId) match.userId = userId;
    
    const summary = await Capital.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          count: { $sum: 1 },
          totalValorUSD: { $sum: "$valorUSD" },
          totalCostoUSD: { $sum: "$costoUSD" },
          totalSalarioMensual: { $sum: "$salarioMensual" },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totals = summary.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.count,
      totalValorUSD: acc.totalValorUSD + item.totalValorUSD,
      totalCostoUSD: acc.totalCostoUSD + item.totalCostoUSD,
    }), { totalItems: 0, totalValorUSD: 0, totalCostoUSD: 0 });
    
    return response.success(res, { byTipo: summary, totals });
  } catch (error) {
    return response.serverError(res, error);
  }
};

export default {
  getByTipo,
  getById,
  createItem,
  updateItem,
  deleteItem,
  getSummaryByTipos,
};
