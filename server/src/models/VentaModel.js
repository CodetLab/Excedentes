import mongoose from "mongoose";

// Modelo simplificado: solo monto en USD (según requisito de Nestor)
const VentaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    montoUSD: { type: Number, required: true, min: 0 },
    descripcion: { type: String, default: "" },
    periodo: { type: String, default: "" }, // mes/año
    fecha: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Venta", VentaSchema);
