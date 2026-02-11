import express from "express";
import {
  getVentasController,
  getVentaByIdController,
  createVentaController,
  updateVentaController,
  deleteVentaController,
} from "../controllers/ventas.controller.js";

const router = express.Router();

router.get("/", getVentasController);
router.get("/:id", getVentaByIdController);
router.post("/", createVentaController);
router.put("/:id", updateVentaController);
router.delete("/:id", deleteVentaController);

export default router;
