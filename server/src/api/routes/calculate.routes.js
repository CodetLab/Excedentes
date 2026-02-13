import { Router } from "express";
import {
  calculate,
  calculateForPeriod,
  getCostTotals,
} from "../controllers/calculate.controller.js";
import {
  validateBody,
  validateObjectId,
  calculateSchema,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * POST /calculate
 * Cálculo directo con datos enviados en el body
 * Validación estricta de inputs (v0.0.3)
 */
router.post("/", validateBody(calculateSchema), calculate);

/**
 * POST /calculate/period/:periodId
 * Calcular usando datos de un período guardado
 */
router.post("/period/:periodId", validateObjectId("periodId"), calculateForPeriod);

/**
 * GET /calculate/costs/:companyId
 * Obtener totales de costos para una empresa
 */
router.get("/costs/:companyId", validateObjectId("companyId"), getCostTotals);

export default router;
