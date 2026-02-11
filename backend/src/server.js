import app from "./app.js";
import { loadEnv, getEnv } from "./config/env.js";
import { connectDb } from "./infrastructure/database/connection.js";

loadEnv();

const port = getEnv("PORT", 5000);

const startServer = async () => {
	await connectDb(getEnv("MONGODB_URI"));
	app.listen(port, () => {
		console.log(`🔥 Server running on port ${port}`);
	});
};

if (process.env.NODE_ENV !== "test") {
	startServer().catch((error) => {
		console.error("❌ Failed to start server:", error);
		process.exit(1);
	});
}
