import express from "express";
import cors from "cors";
import { registerRoutes } from "../interfaces/http.js";
import { errorHandler } from "./infrastructure/web/middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

registerRoutes(app);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("API viva");
});

export default app;
