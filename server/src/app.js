import express from "express";
import cors from "cors";
import { loadEnv, getEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { globalErrorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authenticateJWT } from "./middleware/authenticateJWT.js";
import logger from "./utils/logger.js";
import authRoutes from "./api/routes/auth.routes.js";
import usersRoutes from "./api/routes/users.routes.js";
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
      "Economic Validations",
      "Consolidated Resource Routes"
    ],
    endpoints: {
      auth: ["/api/auth/login", "/api/auth/register"],
      users: [
        "/api/users/setup-company",
        "/api/users/company"
      ],
      capital: [
        "/api/capital",
        "/api/capital/summary",
        "/api/capital/:tipo (tierras|inmuebles|muebles|vehiculos|herramientas|stock)",
        "/api/capital/item/:id"
      ],
      personal: [
        "/api/personal",
        "/api/personal/propio",
        "/api/personal/terceros",
        "/api/personal/summary/totals",
        "/api/personal/:id"
      ],
      transacciones: [
        "/api/ventas",
        "/api/ganancias",
        "/api/extras"
      ],
      calculos: [
        "/api/calculate",
        "/api/calculate/direct",
        "/api/calculate/from-data",
        "/api/calculate/period/:periodId",
        "/api/calculate/preview",
        "/api/calculate/status"
      ],
      dashboard: [
        "/api/dashboard/summary",
        "/api/dashboard/kpis",
        "/api/dashboard/period-summary"
      ],
      otras: [
        "/api/costos",
        "/api/excedentes/calc"
      ]
    }
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authenticateJWT, usersRoutes);
app.use("/api/company", authenticateJWT, usersRoutes); // Alias for company endpoints
app.use("/api/costos", authenticateJWT, costosRoutes);
app.use("/api/capital", authenticateJWT, capitalRoutes);
app.use("/api/personal", authenticateJWT, personalRoutes);
app.use("/api/ventas", authenticateJWT, ventasRoutes);
app.use("/api/ganancias", authenticateJWT, gananciasRoutes);
app.use("/api/extras", authenticateJWT, extrasRoutes);
app.use("/api/excedentes", authenticateJWT, excedentesRoutes);
app.use("/api/dashboard", authenticateJWT, dashboardRoutes);
app.use("/api/calculate", authenticateJWT, calculateRoutes);

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
