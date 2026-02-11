export const buildCostosController = ({
  getCostos,
  createCosto,
  updateCosto,
  deleteCosto,
}) => ({
  getAll: async (req, res, next) => {
    try {
      const costos = await getCostos();
      res.json(costos);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const costo = await createCosto(req.body);
      res.status(201).json(costo);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const costo = await updateCosto(req.params.id, req.body);
      res.json(costo);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await deleteCosto(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
