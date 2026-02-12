import { Router } from "express";
import * as gananciasController from "../controllers/ganancias.controller.js";

const router = Router();

// GET /api/ganancias - Obtener ganancias del usuario
router.get("/", gananciasController.get);

// GET /api/ganancias/total - Obtener total de ganancias
router.get("/total", gananciasController.getTotal);

// POST /api/ganancias - Crear o actualizar ganancias
router.post("/", gananciasController.createOrUpdate);

// DELETE /api/ganancias - Eliminar ganancias
router.delete("/", gananciasController.remove);

export default router;
    
    if (existing) {
      // Actualizar existente
      Object.assign(existing, req.body, { updatedAt: new Date() });
      await existing.save();
      return response.success(res, existing);
    }
    
    // Crear nuevo
    const item = new Capital({
      ...req.body,
      tipo: "GANANCIAS",
      userId,
      nombre: "Ganancias",
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

// PUT /api/ganancias - Actualizar
router.put("/", async (req, res) => {
  try {
    const userId = getOrCreateUserId(req, req.body);
    if (!userId) {
      return response.error(res, "userId es requerido");
    }
    
    let item = await Capital.findOne({ 
      tipo: "GANANCIAS",
      userId 
    });
    
    if (!item) {
      // Crear si no existe
      item = new Capital({
        ...req.body,
        tipo: "GANANCIAS",
        userId,
        nombre: "Ganancias",
      });
    } else {
      Object.assign(item, req.body, { updatedAt: new Date() });
    }
    
    await item.save();
    return response.success(res, item);
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(e => e.message);
      return response.validationError(res, errors);
    }
    return response.error(res, error.message);
  }
});

export default router;
