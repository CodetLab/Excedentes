import dotenv from "dotenv";

export const loadEnv = () => {
  dotenv.config();
};

export const getEnv = (key, fallback = undefined) => {
  if (process.env[key] !== undefined) {
    return process.env[key];
  }

  return fallback;
};
