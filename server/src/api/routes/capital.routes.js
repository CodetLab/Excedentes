import { Router } from "express";
import * as capitalController from "../controllers/capital.controller.js";

const router = Router();

// GET /api/capital - Obtener todos los items de capital
router.get("/", capitalController.getAll);

// GET /api/capital/summary - Resumen agregado
router.get("/summary", capitalController.getSummary);

// GET /api/capital/:tipo - Obtener por tipo (tierras, muebles, etc.)
router.get("/:tipo", capitalController.getByTipo);

// GET /api/capital/item/:id - Obtener item específico
router.get("/item/:id", capitalController.getById);

// POST /api/capital/:tipo - Crear nuevo item
router.post("/:tipo", capitalController.create);

// PUT /api/capital/item/:id - Actualizar item
router.put("/item/:id", capitalController.update);

// DELETE /api/capital/item/:id - Eliminar item
router.delete("/item/:id", capitalController.remove);

export default router;
