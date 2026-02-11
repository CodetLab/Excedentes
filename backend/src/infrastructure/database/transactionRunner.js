import mongoose from "mongoose";

export const runInTransaction = async (work) => {
  const session = await mongoose.startSession();
  let result;

  try {
    await session.withTransaction(async () => {
      result = await work(session);
    });

    return result;
  } finally {
    session.endSession();
  }
};
