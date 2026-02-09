import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getJwtSecret } from "../config/auth.js";

const normalizeEmail = (email) => email.trim().toLowerCase();

const isValidEmail = (email) => /.+@.+\..+/.test(email);

const buildToken = (user) => {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
};

export const registerUser = async ({ name, email, password }) => {
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
    user: { id: user._id.toString(), name: user.name, email: user.email },
  };
};
