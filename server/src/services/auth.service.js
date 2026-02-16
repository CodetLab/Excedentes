import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/CompanyModel.js";
import { getJwtSecret } from "../config/auth.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const buildToken = (user) => {
  // 🔐 FASE 2: JWT con identidad multi-tenant
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    companyId: user.companyId ? user.companyId.toString() : null,
    role: user.role || "company",
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const registerUser = async ({ name, email, password, companyName }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user first (without company)
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
  });

  // If companyName provided, create company and associate user
  let companyId = null;
  if (companyName && companyName.trim()) {
    const company = await Company.create({
      name: companyName.trim(),
      ownerId: user._id,
    });
    companyId = company._id;
    
    // Update user with companyId
    user.companyId = companyId;
    await user.save();
  }

  return {
    token: buildToken(user),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      companyId: companyId ? companyId.toString() : null,
      role: user.role || "company",
    },
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    token: buildToken(user),
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      companyId: user.companyId ? user.companyId.toString() : null,
      role: user.role || "company",
    },
  };
};

// Setup company for existing user without companyId
export const setupCompanyForUser = async (userId, companyName) => {
  if (!companyName || !companyName.trim()) {
    throw new Error("Company name is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.companyId) {
    throw new Error("User already has a company assigned");
  }

  // Create new company with user as owner
  const company = await Company.create({
    name: companyName.trim(),
    ownerId: userId,
  });

  // Update user with companyId
  user.companyId = company._id;
  await user.save();

  return {
    id: company._id.toString(),
    name: company.name,
    createdAt: company.createdAt,
  };
};
