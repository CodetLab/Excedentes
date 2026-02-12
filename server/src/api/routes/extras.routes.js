import { Router } from "express";
import * as extrasController from "../controllers/extras.controller.js";

const router = Router();

// GET /api/extras - Obtener todos los extras
router.get("/", extrasController.getAll);

// GET /api/extras/summary/totals - Obtener resumen de extras
router.get("/summary/totals", extrasController.getSummary);

// GET /api/extras/:id - Obtener un extra por ID
router.get("/:id", extrasController.getById);

// POST /api/extras - Crear un nuevo extra
router.post("/", extrasController.create);

// PUT /api/extras/:id - Actualizar un extra
router.put("/:id", extrasController.update);

// DELETE /api/extras/:id - Eliminar un extra
router.delete("/:id", extrasController.remove);

export default router;
    
    const errors = validateExtrasPayload(normalizedData);
    console.log("VALIDATION ERRORS:", errors);
    if (errors) {
      console.log(">>> VALIDACIÓN FALLÓ:", errors);
      return response.validationError(res, errors);
    }
    
    const userId = getOrCreateUserId(req, req.body);
    if (!userId) {
      return response.error(res, "userId es requerido");
    }
    
    const item = new Capital({
      ...normalizedData,
      tipo: "EXTRAS",
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

// PUT /api/extras/:id - Actualizar un extra
router.put("/:id", async (req, res) => {
  try {
    const normalizedData = normalizeExtrasPayload(req.body);
    
    const item = await Capital.findOneAndUpdate(
      { _id: req.params.id, tipo: "EXTRAS" },
      { ...normalizedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return response.notFound(res, "Extra");
    return response.success(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

// DELETE /api/extras/:id - Eliminar un extra
router.delete("/:id", async (req, res) => {
  try {
    const item = await Capital.findOneAndDelete({ 
      _id: req.params.id,
      tipo: "EXTRAS" 
    });
    if (!item) return response.notFound(res, "Extra");
    return response.success(res, { deleted: true, id: req.params.id });
  } catch (error) {
    return response.serverError(res, error);
  }
});

// GET /api/extras/summary - Resumen de extras
router.get("/summary", async (req, res) => {
  try {
    const userId = getOrCreateUserId(req, {});
    const match = { tipo: "EXTRAS" };
    if (userId) match.userId = userId;
    
    const summary = await Capital.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          totalValorARS: { $sum: "$valorARS" },
          totalValorUSD: { $sum: "$valorUSD" },
        }
      }
    ]);
    
    const result = summary[0] || { count: 0, totalValorARS: 0, totalValorUSD: 0 };
    return response.success(res, result);
  } catch (error) {
    return response.serverError(res, error);
  }
});

export default router;
