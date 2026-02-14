import { Router } from "express";
import {
  calculate,
  calculateDirect,
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
 * NUEVO v0.0.4: Calcula usando datos persistidos
 * Body: { userId, month, year }
 */
router.post("/", calculate);

/**
 * POST /calculate/direct
 * Cálculo directo con datos enviados en el body (simulación)
 * Validación estricta de inputs
 */
router.post("/direct", validateBody(calculateSchema), calculateDirect);

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
