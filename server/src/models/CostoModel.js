import mongoose from "mongoose";

const CostoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  etiqueta: { type: String, required: true },
  monto: { type: Number, required: true },
  tipo: {
    type: String,
    enum: ["FIJO", "VARIABLE"],
    required: true,
  },
});

export default mongoose.model("Costo", CostoSchema);
