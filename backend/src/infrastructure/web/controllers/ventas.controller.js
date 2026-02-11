export const buildVentasController = ({
  getVentas,
  getVentaById,
  createVenta,
  updateVenta,
  deleteVenta,
}) => ({
  getAll: async (req, res, next) => {
    try {
      const ventas = await getVentas();
      res.json(ventas);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const venta = await getVentaById(req.params.id);
      res.json(venta);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const venta = await createVenta(req.body);
      res.status(201).json(venta);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const venta = await updateVenta(req.params.id, req.body);
      res.json(venta);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await deleteVenta(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
