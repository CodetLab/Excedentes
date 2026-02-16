import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    // 🔐 FASE 1: Multi-tenant identity
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: false, // Nullable inicialmente para migraciones
    },
    role: {
      type: String,
      enum: ["admin", "company"],
      default: "company",
    },
  },
  { timestamps: true }
);

// Índices para búsquedas multi-tenant
// Note: email index es creado automáticamente por unique: true
userSchema.index({ companyId: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);

export default User;
