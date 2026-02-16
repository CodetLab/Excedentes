import mongoose from "mongoose";

// Modelo simplificado: solo monto en USD (según requisito de Nestor)
const VentaSchema = new mongoose.Schema(
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
      // Mantener para compatibilidad backward, pero no es obligatorio
    },
    montoUSD: { type: Number, required: true, min: 0 },
    descripcion: { type: String, default: "" },
    periodo: { type: String, default: "" }, // mes/año
    fecha: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Índices para multi-tenant
VentaSchema.index({ companyId: 1, periodo: 1 });
VentaSchema.index({ userId: 1 }); // Mantener para queries legadas

export default mongoose.model("Venta", VentaSchema);
