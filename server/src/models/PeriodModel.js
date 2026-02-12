import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del período es requerido"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "La fecha de inicio es requerida"],
    },
    endDate: {
      type: Date,
      required: [true, "La fecha de fin es requerida"],
    },
    // Mes y año para control de duplicados
    month: {
      type: Number,
      min: [1, "El mes debe ser entre 1 y 12"],
      max: [12, "El mes debe ser entre 1 y 12"],
      required: [true, "El mes es requerido"],
    },
    year: {
      type: Number,
      min: [2000, "El año debe ser mayor a 2000"],
      max: [2100, "El año debe ser menor a 2100"],
      required: [true, "El año es requerido"],
    },
    // Datos económicos del período
    sales: {
      type: Number,
      min: [0, "Las ventas no pueden ser negativas"],
      default: 0,
    },
    profit: {
      type: Number,
      min: [0, "La ganancia no puede ser negativa"],
      default: 0,
    },
    fixedCapitalCosts: {
      type: Number,
      min: [0, "Los costos fijos de capital no pueden ser negativos"],
      default: 0,
    },
    fixedLaborCosts: {
      type: Number,
      min: [0, "Los costos fijos de trabajo no pueden ser negativos"],
      default: 0,
    },
    amortization: {
      type: Number,
      min: [0, "La amortización no puede ser negativa"],
      default: 0,
    },
    interests: {
      type: Number,
      min: [0, "Los intereses no pueden ser negativos"],
      default: 0,
    },
    inflationIndex: {
      type: Number,
      min: [0, "El índice de inflación no puede ser negativo"],
      default: 1,
    },
    currency: {
      type: String,
      enum: ["USD", "ARS", "EUR"],
      default: "USD",
    },
    accountingCriteria: {
      type: String,
      enum: ["ACCRUAL", "CASH"],
      default: "ACCRUAL",
    },
    // Estado del período
    status: {
      type: String,
      enum: ["DRAFT", "CALCULATED", "CERTIFIED", "LOCKED"],
      default: "DRAFT",
    },
    // Resultado del cálculo (se guarda después de calcular)
    calculationResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    calculatedAt: {
      type: Date,
      default: null,
    },
    // Certificación
    certificateHash: {
      type: String,
      default: null,
    },
    certifiedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      maxlength: [1000, "Las notas no pueden exceder 1000 caracteres"],
    },
  },
  {
    timestamps: true,
  }
);

periodSchema.index({ companyId: 1 });
periodSchema.index({ companyId: 1, status: 1 });
periodSchema.index({ companyId: 1, startDate: 1, endDate: 1 });
// Índice único para prevenir períodos duplicados (mismo mes/año/empresa)
periodSchema.index({ companyId: 1, month: 1, year: 1 }, { unique: true });

// Validar que endDate > startDate
periodSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    return next(new Error("La fecha de fin debe ser posterior a la fecha de inicio"));
  }
  next();
});

// No permitir modificaciones si está LOCKED
periodSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew && this.status === "LOCKED") {
    return next(new Error("No se puede modificar un período certificado/bloqueado"));
  }
  next();
});

const Period = mongoose.model("Period", periodSchema);
export default Period;
