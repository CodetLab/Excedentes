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

