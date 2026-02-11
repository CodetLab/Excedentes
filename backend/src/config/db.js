import mongoose from "mongoose";

export const connectDb = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
};
