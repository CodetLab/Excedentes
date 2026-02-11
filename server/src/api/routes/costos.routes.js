import express from "express";
import {
  getCostos,
  createCosto,
  updateCosto,
  deleteCosto
} from "../controllers/costos.controller.js";

const router = express.Router();

router.get("/", getCostos);
router.post("/", createCosto);
router.put("/:id", updateCosto);
router.delete("/:id", deleteCosto);

export default router;
