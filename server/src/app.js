import express from "express";
import cors from "cors";
import { loadEnv, getEnv } from "./config/env.js";
import { connectDb } from "./config/db.js";
import authRoutes from "./api/routes/auth.routes.js";
import costosRoutes from "./api/routes/costos.routes.js";
import productosRoutes from "./api/routes/productos.routes.js";
import ventasRoutes from "./api/routes/ventas.routes.js";

loadEnv();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API viva");
});

app.use("/api/auth", authRoutes);
app.use("/api/costos", costosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/ventas", ventasRoutes);

const port = getEnv("PORT", 5000);
const startServer = async () => {
  try {
    await connectDb();
    console.log("DB conectada");
  } catch (err) {
    console.error("DB error:", err);
  }

  app.listen(port, () => {
    console.log(`🔥 Server running on port ${port}`);
  });
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
