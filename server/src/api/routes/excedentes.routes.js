import { Router } from "express";
import * as excedentesController from "../controllers/excedentes.controller.js";

const router = Router();

// POST /api/excedentes/calc - Calcular excedentes
router.post("/calc", excedentesController.calculate);

export default router;
