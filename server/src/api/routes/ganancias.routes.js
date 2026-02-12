import { Router } from "express";
import Capital from "../../models/CapitalModel.js";

const router = Router();

// GET /api/ganancias - Obtener datos de ganancias
router.get("/", async (req, res) => {
  try {
    const filter = { tipo: "GANANCIAS" };
    if (req.user?.id) filter.userId = req.user.id;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    
    // Si hay un registro, devolver el primero; sino devolver estructura vacía
    if (items.length > 0) {
      res.json(items[0]);
    } else {
      res.json({
        tipo: "GANANCIAS",
        mes: new Date().getMonth() + 1,
        anio: new Date().getFullYear(),
        totalGanancias: 0,
        desglose: {
          gananciaCapital: 0,
          gananciaPersonal: 0
        },
        notas: ""
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ganancias - Crear o actualizar
router.post("/", async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    // Buscar si ya existe un registro de ganancias para este usuario
    const existing = await Capital.findOne({ 
      tipo: "GANANCIAS",
      userId 
    });
    
    if (existing) {
      // Actualizar existente
      Object.assign(existing, req.body, { updatedAt: new Date() });
      await existing.save();
      return res.json(existing);
    }
    
    // Crear nuevo
    const item = new Capital({
      ...req.body,
      tipo: "GANANCIAS",
      userId,
      nombre: "Ganancias",
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/ganancias - Actualizar
router.put("/", async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    let item = await Capital.findOne({ 
      tipo: "GANANCIAS",
      userId 
    });
    
    if (!item) {
      // Crear si no existe
      item = new Capital({
        ...req.body,
        tipo: "GANANCIAS",
        userId,
        nombre: "Ganancias",
      });
    } else {
      Object.assign(item, req.body, { updatedAt: new Date() });
    }
    
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
