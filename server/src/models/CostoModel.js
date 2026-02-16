import mongoose from "mongoose";

// Modelo de costos fijos (según Nestor: solo se cargan costos fijos)
const CostoSchema = new mongoose.Schema(
  {
    // 🔐 FASE 1: Multi-tenant support
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // Mantener para compatibilidad backward
    },
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

// Índices para multi-tenant
CostoSchema.index({ companyId: 1, tipo: 1 });
CostoSchema.index({ userId: 1, tipo: 1 }); // Mantener para compatibilidad

export default mongoose.model("Costo", CostoSchema);
