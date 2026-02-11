import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../infrastructure/database/models/UserModel.js";
import { getJwtSecret } from "../../config/auth.js";
import { AppError } from "../../shared/errors/AppError.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const buildToken = (user) => {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const registerUser = async ({ name, email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  if (!isValidEmail(email)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new AppError("Email already registered", 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
  });

  return {
    token: buildToken(user),
    user: { id: user._id.toString(), name: user.name, email: user.email },
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordHash"
  );

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    token: buildToken(user),
    user: { id: user._id.toString(), name: user.name, email: user.email },
  };
};
