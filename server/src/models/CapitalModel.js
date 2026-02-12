import mongoose from "mongoose";

// Schema genérico para todos los tipos de capital
// Cada tipo tiene campos específicos según las planillas de Nestor
const CapitalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tipo: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    // Campos comunes
    nombre: { type: String, required: true },
    descripcion: { type: String, default: "" },
    
    // Valores monetarios (siempre >= 0)
    valorUSD: { type: Number, default: 0, min: 0 },
    costoUSD: { type: Number, default: 0, min: 0 },
    
    // Campos específicos por tipo (flexibles)
    cantidad: { type: Number, default: 1, min: 0 },
    unidad: { type: String, default: "unidad" },
    
    // Para Tierras
    superficie: { type: Number, default: 0, min: 0 },
    ubicacion: { type: String, default: "" },
    
    // Para Vehículos/Muebles/Herramientas
    marca: { type: String, default: "" },
    modelo: { type: String, default: "" },
    anio: { type: Number, default: null },
    
    // Para Personal
    cargo: { type: String, default: "" },
    salarioMensual: { type: Number, default: 0, min: 0 },
    
    // Para Stock
    stockActual: { type: Number, default: 0, min: 0 },
    
    // Metadatos
    activo: { type: Boolean, default: true },
    notas: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Índices para búsquedas eficientes
CapitalSchema.index({ userId: 1, tipo: 1 });
CapitalSchema.index({ tipo: 1 });

export default mongoose.model("Capital", CapitalSchema);
