import mongoose from "mongoose";

const ASSET_CATEGORIES = [
  "LAND",           // Tierras
  "BUILDING",       // Inmuebles
  "VEHICLE",        // Vehículos
  "MACHINERY",      // Maquinaria
  "EQUIPMENT",      // Equipos
  "FURNITURE",      // Muebles
  "TOOLS",          // Herramientas
  "INVENTORY",      // Inventario/Stock
  "INTANGIBLE",     // Intangibles (marcas, patentes)
  "OTHER",          // Otros
];

const assetSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del activo es requerido"],
      trim: true,
      maxlength: [200, "El nombre no puede exceder 200 caracteres"],
    },
    category: {
      type: String,
      enum: ASSET_CATEGORIES,
      required: [true, "La categoría es requerida"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },
    acquisitionValue: {
      type: Number,
      required: [true, "El valor de adquisición es requerido"],
      min: [0, "El valor no puede ser negativo"],
    },
    currentValue: {
      type: Number,
      min: [0, "El valor no puede ser negativo"],
    },
    currency: {
      type: String,
      enum: ["USD", "ARS", "EUR"],
      default: "USD",
    },
    acquisitionDate: {
      type: Date,
      default: Date.now,
    },
    usefulLifeYears: {
      type: Number,
      min: [0, "La vida útil no puede ser negativa"],
      default: 10,
    },
    depreciationMethod: {
      type: String,
      enum: ["LINEAR", "ACCELERATED", "NONE"],
      default: "LINEAR",
    },
    annualDepreciation: {
      type: Number,
      min: [0, "La depreciación no puede ser negativa"],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

assetSchema.index({ companyId: 1 });
assetSchema.index({ companyId: 1, category: 1 });
assetSchema.index({ companyId: 1, isActive: 1 });

// Calcular valor actual si no está definido
assetSchema.pre("save", function (next) {
  if (this.currentValue === undefined || this.currentValue === null) {
    this.currentValue = this.acquisitionValue;
  }
  next();
});

const Asset = mongoose.model("Asset", assetSchema);
export default Asset;
