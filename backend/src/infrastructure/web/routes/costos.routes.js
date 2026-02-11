import express from "express";

export const buildCostosRouter = (controller) => {
  const router = express.Router();

  router.get("/", controller.getAll);
  router.post("/", controller.create);
  router.put("/:id", controller.update);
  router.delete("/:id", controller.remove);

  return router;
};
