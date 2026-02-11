import express from "express";
import {
  getProductosController,
  getProductoByIdController,
  createProductoController,
  updateProductoController,
  deleteProductoController,
} from "../controllers/productos.controller.js";

const router = express.Router();

router.get("/", getProductosController);
router.get("/:id", getProductoByIdController);
router.post("/", createProductoController);
router.put("/:id", updateProductoController);
router.delete("/:id", deleteProductoController);

export default router;
