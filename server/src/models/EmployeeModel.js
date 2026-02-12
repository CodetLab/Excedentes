import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: {
      type: String,
      required: [true, "El nombre del empleado es requerido"],
      trim: true,
      maxlength: [150, "El nombre no puede exceder 150 caracteres"],
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    baseSalary: {
      type: Number,
      required: [true, "El salario base es requerido"],
      min: [0, "El salario no puede ser negativo"],
    },
    currency: {
      type: String,
      enum: ["USD", "ARS", "EUR"],
      default: "USD",
    },
    productivityIndex: {
      type: Number,
      min: [0, "El índice de productividad no puede ser negativo"],
      max: [10, "El índice de productividad no puede exceder 10"],
      default: 1,
    },
    hireDate: {
      type: Date,
      default: Date.now,
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

employeeSchema.index({ companyId: 1 });
employeeSchema.index({ companyId: 1, isActive: 1 });

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
