import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import authRouter from "./api/routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);

const port = process.env.PORT || 3000;
const startServer = async () => {
	await connectDb();
	app.listen(port, () => {
		console.log(`Server running on port ${port}`);
	});
};

if (process.env.NODE_ENV !== "test") {
	startServer().catch((error) => {
		console.error("Failed to start server:", error);
		process.exit(1);
	});
}

export default app;
