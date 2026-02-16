// ════════════════════════════════════════════════════════════════════
// QUICK FIX CODE SNIPPETS - Controllers & Services
// Copia directamente si tienes problemas
// ════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════
// 1️⃣ EXTRAS CONTROLLER (si está faltando)
// ════════════════════════════════════════════════════════════════════
// server/src/api/controllers/extras.controller.js

import extrasService from "../../services/extras.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  console.log(`[EXTRAS] getAll companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const extras = await extrasService.getAll(companyId);
  sendSuccess(res, extras);
});

export const getById = asyncHandler(async (req, res) => {
  const extras = await extrasService.getById(req.params.id);
  sendSuccess(res, extras);
});

export const create = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  console.log(`[EXTRAS] create companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const extras = await extrasService.create(req.body, companyId);
  sendSuccess(res, extras, 201);
});

export const update = asyncHandler(async (req, res) => {
  const extras = await extrasService.update(req.params.id, req.body);
  sendSuccess(res, extras);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await extrasService.delete(req.params.id);
  sendSuccess(res, result);
});

export const getSummary = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  console.log(`[EXTRAS] getSummary companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  const summary = await extrasService.getSummary(companyId);
  sendSuccess(res, summary);
});

// ════════════════════════════════════════════════════════════════════
// 2️⃣ EXTRAS SERVICE (si está faltando)
// ════════════════════════════════════════════════════════════════════
// server/src/services/extras.service.js

import capitalRepository from "../repositories/capital.repository.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

class ExtrasService {
  async getAll(companyId) {
    console.log(`[EXTRAS] getAll companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    
    return capitalRepository.find({
      companyId,
      tipo: "EXTRAS"
    });
  }

  async getById(id) {
    const item = await capitalRepository.findById(id);
    if (!item) throw new NotFoundError("Extra", id);
    return item;
  }

  async create(data, companyId) {
    console.log(`[EXTRAS] create companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");

    return capitalRepository.create({
      ...data,
      tipo: "EXTRAS",
      companyId,
    });
  }

  async update(id, data) {
    const existing = await this.getById(id);
    return capitalRepository.update(id, data);
  }

  async delete(id) {
    const item = await capitalRepository.delete(id);
    if (!item) throw new NotFoundError("Extra", id);
    return { deleted: true, id };
  }

  async getSummary(companyId) {
    console.log(`[EXTRAS] getSummary companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");

    const items = await capitalRepository.find({
      companyId,
      tipo: "EXTRAS"
    });

    return {
      count: items.length,
      total: items.reduce((sum, e) => sum + (e.costoUSD || 0), 0),
      items
    };
  }
}

export default new ExtrasService();

// ════════════════════════════════════════════════════════════════════
// 3️⃣ COSTOS CONTROLLER (Template si falta)
// ════════════════════════════════════════════════════════════════════
// server/src/api/controllers/costos.controller.js

import costosService from "../../services/costos.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { asyncHandler } from "../../middleware/errorHandler.js";

export const getAll = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) return sendError(res, 403, "Acceso denegado");
  
  const costos = await costosService.getAll(companyId);
  sendSuccess(res, costos);
});

export const create = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  if (!companyId) return sendError(res, 403, "Acceso denegado");
  
  const costo = await costosService.create(req.body, companyId);
  sendSuccess(res, costo, 201);
});

export const update = asyncHandler(async (req, res) => {
  const costo = await costosService.update(req.params.id, req.body);
  sendSuccess(res, costo);
});

export const remove = asyncHandler(async (req, res) => {
  const result = await costosService.delete(req.params.id);
  sendSuccess(res, result);
});

// ════════════════════════════════════════════════════════════════════
// 4️⃣ DATA CONSOLIDATION SERVICE FIX (Si da error sin ventas)
// ════════════════════════════════════════════════════════════════════
// REEMPLAZA _validateConsolidatedData en data-consolidation.service.js

  _validateConsolidatedData(data) {
    console.log(`[CONSOLIDATION] Validando datos`, {
      sales: data.sales,
      totalCosts: data.totalCosts
    });

    // NOTA: Permitir 0 ventas si no hay datos para el período
    // ANTES: if (data.sales === 0) throw new ValidationError(...)
    // AHORA: Solo validar si hay datos
    
    if (data.sales < 0) {
      throw new ValidationError("El total de ventas no puede ser negativo");
    }

    if (data.totalFixedCosts < 0) {
      throw new ValidationError("El total de costos fijos no puede ser negativo");
    }

    // Si sales === 0, retornar datos válidos con los ceros
    // El dashboard debe saber manejar períodos sin datos
  }

// ════════════════════════════════════════════════════════════════════
// 5️⃣ GENERIC SERVICE TEMPLATE (Para cualquier nuevo servicio)
// ════════════════════════════════════════════════════════════════════

class GenericService {
  // ✅ PATRÓN: companyId siempre como PRIMER parámetro
  // ✅ PATRÓN: SIEMPRE validar que NO es null/undefined
  
  async getAll(companyId) {
    console.log(`[SERVICE] getAll companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    
    return repository.find({ companyId });
  }

  async create(data, companyId) {
    console.log(`[SERVICE] create companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    
    return repository.create({ ...data, companyId });
  }

  async getSummary(companyId) {
    console.log(`[SERVICE] getSummary companyId=${companyId}`);
    if (!companyId) throw new ValidationError("companyId es requerido");
    
    const items = await repository.find({ companyId });
    return { count: items.length, items };
  }
}

// ════════════════════════════════════════════════════════════════════
// 6️⃣ GENERIC CONTROLLER TEMPLATE
// ════════════════════════════════════════════════════════════════════

export const getAll = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  
  // ✅ PATRÓN: SIEMPRE extraer companyId de req
  // ✅ PATRÓN: SIEMPRE validar que no es null
  // ✅ PATRÓN: SIEMPRE pasarlo al service como PRIMER parámetro
  // ✅ PATRÓN: SIEMPRE loguear para debugging
  
  console.log(`[CONTROLLER] getAll companyId=${companyId}`);
  
  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }
  
  const data = await myService.getAll(companyId);
  sendSuccess(res, data);
});

// ════════════════════════════════════════════════════════════════════
// 7️⃣ VALIDAR PARÁMETROS QUERY (Para período-summary y similares)
// ════════════════════════════════════════════════════════════════════

export const getPeriodSummary = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  const { month, year } = req.query;

  console.log(`[DASHBOARD] getPeriodSummary`, { companyId, month, year });

  if (!companyId) {
    return sendError(res, 403, "Acceso denegado: companyId requerido");
  }

  // ✅ PATRÓN: Validar TODOS los query params explícitamente
  if (!month || !year) {
    return sendError(res, 400, "month y year son requeridos en query params");
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);

  // ✅ PATRÓN: Validar TIPOS de datos
  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return sendError(res, 400, `month inválido: ${month} (usa 1-12)`);
  }

  if (!Number.isInteger(yearNum) || yearNum < 2000) {
    return sendError(res, 400, `year inválido: ${year} (usa >= 2000)`);
  }

  const result = await consolidationService.consolidateByPeriod(
    companyId,
    monthNum,
    yearNum
  );

  sendSuccess(res, result);
});

// ════════════════════════════════════════════════════════════════════
