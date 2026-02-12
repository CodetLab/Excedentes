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
