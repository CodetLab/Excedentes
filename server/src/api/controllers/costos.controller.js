import Costo from "../../models/CostoModel.js";

export const getCostos = async (req, res) => {
  try {
    const costos = await Costo.find();
    res.json(costos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener costos" });
  }
};

export const updateCosto = async (req, res) => {
  try {
    const costo = await Costo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(costo);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar costo" });
  }
};

export const deleteCosto = async (req, res) => {
  try {
    await Costo.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar costo" });
  }
};



export const createCosto = async (req, res) => {
  try {
    console.log("📥 BODY:", req.body);

    const nuevoCosto = new Costo(req.body);
    await nuevoCosto.save();

    res.status(201).json(nuevoCosto);
  } catch (error) {
    console.error("❌ ERROR REAL:", error);
    res.status(500).json({
      message: "Error creando costo",
      error: error.message
    });
  }
};
