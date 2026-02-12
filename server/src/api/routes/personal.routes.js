import { Router } from "express";
import * as personalController from "../controllers/personal.controller.js";

const router = Router();

// GET /api/personal - Obtener todo el personal
router.get("/", personalController.getAll);

// GET /api/personal/propio - Obtener personal propio
router.get("/propio", personalController.getPropio);

// GET /api/personal/terceros - Obtener personal terceros
router.get("/terceros", personalController.getTerceros);

// GET /api/personal/summary/totals - Obtener resumen de personal
router.get("/summary/totals", personalController.getSummary);

// GET /api/personal/:id - Obtener personal por ID
router.get("/:id", personalController.getById);

// POST /api/personal/propio - Crear personal propio
router.post("/propio", personalController.createPropio);

// POST /api/personal/terceros - Crear personal terceros
router.post("/terceros", personalController.createTerceros);

// PUT /api/personal/:id - Actualizar personal
router.put("/:id", personalController.update);

// DELETE /api/personal/:id - Eliminar personal
router.delete("/:id", personalController.remove);

export default router;
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

// PUT /api/personal/propio/:id
router.put("/propio/:id", async (req, res) => {
  try {
    const normalizedData = normalizePersonalPayload(req.body, "PERSONAL_PROPIO");
    
    const item = await Capital.findByIdAndUpdate(
      req.params.id,
      { ...normalizedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return response.notFound(res, "Personal propio");
    return response.success(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

// DELETE /api/personal/propio/:id
router.delete("/propio/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return response.notFound(res, "Personal propio");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
});

// ==========================================
// Personal Terceros Routes
// ==========================================

// GET /api/personal/terceros
router.get("/terceros", async (req, res) => {
  try {
    const userId = getOrCreateUserId(req, {});
    const filter = { tipo: "PERSONAL_TERCEROS" };
    if (userId) filter.userId = userId;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    return response.success(res, items);
  } catch (error) {
    return response.serverError(res, error);
  }
});

// POST /api/personal/terceros
router.post("/terceros", async (req, res) => {
  try {
    const normalizedData = normalizePersonalPayload(req.body, "PERSONAL_TERCEROS");
    const errors = validatePersonalPayload(normalizedData);
    if (errors) {
      return response.validationError(res, errors);
    }
    
    const userId = getOrCreateUserId(req, req.body);
    if (!userId) {
      return response.error(res, "userId es requerido");
    }
    
    const item = new Capital({
      ...normalizedData,
      tipo: "PERSONAL_TERCEROS",
      userId,
    });
    await item.save();
    return response.created(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

// PUT /api/personal/terceros/:id
router.put("/terceros/:id", async (req, res) => {
  try {
    const normalizedData = normalizePersonalPayload(req.body, "PERSONAL_TERCEROS");
    
    const item = await Capital.findByIdAndUpdate(
      req.params.id,
      { ...normalizedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return response.notFound(res, "Personal terceros");
    return response.success(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

// DELETE /api/personal/terceros/:id
router.delete("/terceros/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return response.notFound(res, "Personal terceros");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
});

// ==========================================
// GET /api/personal/summary - Resumen consolidado
// ==========================================
router.get("/summary", async (req, res) => {
  try {
    const userId = getOrCreateUserId(req, {});
    const match = { tipo: { $in: ["PERSONAL_PROPIO", "PERSONAL_TERCEROS"] } };
    if (userId) match.userId = userId;
    
    const summary = await Capital.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          count: { $sum: 1 },
          totalSalarioMensual: { $sum: "$salarioMensual" },
          totalCostoUSD: { $sum: "$costoUSD" },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totals = summary.reduce((acc, item) => ({
      totalPersonal: acc.totalPersonal + item.count,
      totalSalarioMensual: acc.totalSalarioMensual + item.totalSalarioMensual,
      totalCostoUSD: acc.totalCostoUSD + item.totalCostoUSD,
    }), { totalPersonal: 0, totalSalarioMensual: 0, totalCostoUSD: 0 });
    
    return response.success(res, { byTipo: summary, totals });
  } catch (error) {
    return response.serverError(res, error);
  }
});

export default router;
