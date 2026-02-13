import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();

// GET /api/dashboard/summary - Resumen para gráficos
router.get("/summary", dashboardController.getSummary);

// GET /api/dashboard/kpis - KPIs principales
router.get("/kpis", dashboardController.getKPIs);

export default router;
