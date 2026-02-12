import { Router } from "express";
import Capital from "../../models/CapitalModel.js";

const router = Router();

// ==========================================
// Personal Propio Routes
// ==========================================

// GET /api/personal/propio
router.get("/propio", async (req, res) => {
  try {
    const filter = { tipo: "PERSONAL_PROPIO" };
    if (req.user?.id) filter.userId = req.user.id;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/personal/propio
router.post("/propio", async (req, res) => {
  try {
    const item = new Capital({
      ...req.body,
      tipo: "PERSONAL_PROPIO",
      userId: req.user?.id || req.body.userId,
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/personal/propio/:id
router.put("/propio/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/personal/propio/:id
router.delete("/propio/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// Personal Terceros Routes
// ==========================================

// GET /api/personal/terceros
router.get("/terceros", async (req, res) => {
  try {
    const filter = { tipo: "PERSONAL_TERCEROS" };
    if (req.user?.id) filter.userId = req.user.id;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/personal/terceros
router.post("/terceros", async (req, res) => {
  try {
    const item = new Capital({
      ...req.body,
      tipo: "PERSONAL_TERCEROS",
      userId: req.user?.id || req.body.userId,
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/personal/terceros/:id
router.put("/terceros/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/personal/terceros/:id
router.delete("/terceros/:id", async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
