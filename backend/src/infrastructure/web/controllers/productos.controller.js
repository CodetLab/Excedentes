export const buildProductosController = ({
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
}) => ({
  getAll: async (req, res, next) => {
    try {
      const productos = await getProductos();
      res.json(productos);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const producto = await getProductoById(req.params.id);
      res.json(producto);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const producto = await createProducto(req.body);
      res.status(201).json(producto);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const producto = await updateProducto(req.params.id, req.body);
      res.json(producto);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      await deleteProducto(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
});
