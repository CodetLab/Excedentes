import Capital from "../../models/CapitalModel.js";

// Tipos válidos de capital
const TIPOS_VALIDOS = [
  "TIERRAS",
  "INMUEBLES",
  "MUEBLES",
  "VEHICULOS", 
  "HERRAMIENTAS",
  "STOCK",
  "PERSONAL_PROPIO",
  "PERSONAL_TERCEROS",
  "VENTAS",
  "GANANCIAS",
  "EXTRAS"
];

// GET /api/capital - Obtener todo el capital del usuario
export const getAll = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tipo } = req.query;
    
    const filter = userId ? { userId } : {};
    if (tipo && TIPOS_VALIDOS.includes(tipo.toUpperCase())) {
      filter.tipo = tipo.toUpperCase();
    }
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/capital/:tipo - Obtener por tipo específico
export const getByTipo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tipo } = req.params;
    
    if (!TIPOS_VALIDOS.includes(tipo.toUpperCase())) {
      return res.status(400).json({ error: `Tipo inválido. Usar: ${TIPOS_VALIDOS.join(", ")}` });
    }
    
    const filter = { tipo: tipo.toUpperCase() };
    if (userId) filter.userId = userId;
    
    const items = await Capital.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/capital/item/:id - Obtener un item específico
export const getById = async (req, res) => {
  try {
    const item = await Capital.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/capital/:tipo - Crear nuevo item de capital
export const create = async (req, res) => {
  try {
    const { tipo } = req.params;
    
    if (!TIPOS_VALIDOS.includes(tipo.toUpperCase())) {
      return res.status(400).json({ error: `Tipo inválido. Usar: ${TIPOS_VALIDOS.join(", ")}` });
    }
    
    // Validar campos monetarios >= 0
    const monetaryFields = ["valorUSD", "costoUSD", "salarioMensual"];
    for (const field of monetaryFields) {
      if (req.body[field] !== undefined && req.body[field] < 0) {
        return res.status(400).json({ error: `${field} debe ser >= 0` });
      }
    }
    
    const item = new Capital({
      ...req.body,
      tipo: tipo.toUpperCase(),
      userId: req.user?.id || req.body.userId,
    });
    
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// PUT /api/capital/item/:id - Actualizar item
export const update = async (req, res) => {
  try {
    // Validar campos monetarios >= 0
    const monetaryFields = ["valorUSD", "costoUSD", "salarioMensual"];
    for (const field of monetaryFields) {
      if (req.body[field] !== undefined && req.body[field] < 0) {
        return res.status(400).json({ error: `${field} debe ser >= 0` });
      }
    }
    
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
};

// DELETE /api/capital/item/:id - Eliminar item
export const remove = async (req, res) => {
  try {
    const item = await Capital.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "No encontrado" });
    res.json({ message: "Eliminado", id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/capital/summary - Resumen agregado por tipo
export const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const match = userId ? { userId: userId } : {};
    
    const summary = await Capital.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$tipo",
          count: { $sum: 1 },
          totalValorUSD: { $sum: "$valorUSD" },
          totalCostoUSD: { $sum: "$costoUSD" },
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Calcular totales generales
    const totals = summary.reduce((acc, item) => ({
      totalItems: acc.totalItems + item.count,
      totalValorUSD: acc.totalValorUSD + item.totalValorUSD,
      totalCostoUSD: acc.totalCostoUSD + item.totalCostoUSD,
    }), { totalItems: 0, totalValorUSD: 0, totalCostoUSD: 0 });
    
    res.json({ byTipo: summary, totals });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
