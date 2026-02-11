import mongoose from "mongoose";

export const connectDb = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
};
