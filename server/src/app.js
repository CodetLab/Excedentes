import express from "express";
import cors from "cors";
import { loadEnv, getEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import authRoutes from "./api/routes/auth.routes.js";
import costosRoutes from "./api/routes/costos.routes.js";
import capitalRoutes from "./api/routes/capital.routes.js";
import personalRoutes from "./api/routes/personal.routes.js";
import ventasRoutes from "./api/routes/ventas.routes.js";
import gananciasRoutes from "./api/routes/ganancias.routes.js";
import extrasRoutes from "./api/routes/extras.routes.js";
import excedentesRoutes from "./api/routes/excedentes.routes.js";
import dashboardRoutes from "./api/routes/dashboard.routes.js";
import calculateRoutes from "./api/routes/calculate.routes.js";

loadEnv();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    status: "API running", 
    version: "0.0.5",
    features: [
      "Data Integrity & Economic Safety",
      "Structured Error Handling",
      "Normalized Responses {success, data, timestamp}",
      "Economic Validations"
    ],
    endpoints: [
      "/api/auth",
      "/api/costos", 
      "/api/capital",
      "/api/capital/:tipo",
      "/api/personal/propio",
      "/api/personal/terceros",
      "/api/personal/summary",
      "/api/ventas",
      "/api/ganancias",
      "/api/extras",
      "/api/excedentes/calc",
      "/api/dashboard/summary",
      "/api/calculate"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/costos", costosRoutes);
app.use("/api/capital", capitalRoutes);
app.use("/api/personal", personalRoutes);
app.use("/api/ventas", ventasRoutes);
app.use("/api/ganancias", gananciasRoutes);
app.use("/api/extras", extrasRoutes);
app.use("/api/excedentes", excedentesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calculate", calculateRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

const port = getEnv("PORT", 5000);
const startServer = async () => {
  try {
    await connectDb();
    logger.info("SERVER", "Database connected");
  } catch (err) {
    logger.error("SERVER", "Database connection failed", { error: err.message });
  }

  app.listen(port, () => {
    logger.info("SERVER", `Server running on port ${port}`, { version: "0.0.4" });
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
