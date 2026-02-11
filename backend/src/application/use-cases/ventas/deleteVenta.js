import { AppError } from "../../../shared/errors/AppError.js";

const buildProductMap = (products) => {
  return new Map(products.map((product) => [product._id.toString(), product]));
};

export const buildDeleteVenta = ({
  ventaRepository,
  productoRepository,
  transactionRunner,
}) => async (id) => {
  return transactionRunner(async (session) => {
    const venta = await ventaRepository.getById(id, { session });

    if (!venta) {
      throw new AppError("Venta no encontrada", 404);
    }

    const ids = venta.products.map((item) => item.productId);
    const productos = await productoRepository.findByIds(ids, { session });

    if (productos.length !== ids.length) {
      throw new AppError("Producto no encontrado", 404);
    }

    const productosMap = buildProductMap(productos);

    for (const item of venta.products) {
      const producto = productosMap.get(item.productId.toString());

      if (!producto) {
        throw new AppError("Producto no encontrado", 404);
      }

      await productoRepository.adjustStock(
        item.productId,
        Number(item.quantity),
        { session }
      );
    }

    await ventaRepository.deleteById(id, { session });

    return venta;
  });
};
