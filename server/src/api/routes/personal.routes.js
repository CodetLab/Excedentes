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
