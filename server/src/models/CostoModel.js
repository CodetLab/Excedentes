import mongoose from "mongoose";

// Modelo de costos fijos (según Nestor: solo se cargan costos fijos)
const CostoSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nombre: { type: String, required: true },
    etiqueta: { type: String, required: true }, // personal, materia prima, etc.
    monto: { type: Number, required: true, min: 0 },
    tipo: {
      type: String,
      enum: ["FIJO", "VARIABLE"],
      default: "FIJO",
      required: true,
    },
    descripcion: { type: String, default: "" },
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

CostoSchema.index({ userId: 1, tipo: 1 });

export default mongoose.model("Costo", CostoSchema);
