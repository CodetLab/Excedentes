import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la empresa es requerido"],
      trim: true,
      maxlength: [200, "El nombre no puede exceder 200 caracteres"],
    },
    cuit: {
      type: String,
      trim: true,
      match: [/^\d{2}-\d{8}-\d{1}$/, "CUIT inválido (formato: XX-XXXXXXXX-X)"],
    },
    industry: {
      type: String,
      trim: true,
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
    fiscalYearStart: {
      type: Number,
      min: 1,
      max: 12,
      default: 1, // Enero
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

companySchema.index({ ownerId: 1 });
companySchema.index({ cuit: 1 }, { sparse: true });

const Company = mongoose.model("Company", companySchema);
export default Company;
