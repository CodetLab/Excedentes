import { AppError } from "../../../shared/errors/AppError.js";
import { calculateTotalAmount } from "../../services/ventaTotals.js";

const validateProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new AppError("Productos requeridos", 400);
  }

  for (const item of products) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (!item.productId) {
      throw new AppError("Producto requerido", 400);
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new AppError("Cantidad invalida", 400);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new AppError("Precio unitario invalido", 400);
    }
  }
};

const buildProductMap = (products) => {
  return new Map(products.map((product) => [product._id.toString(), product]));
};

export const buildUpdateVenta = ({
  ventaRepository,
  productoRepository,
  transactionRunner,
}) => async (id, data) => {
  return transactionRunner(async (session) => {
    const venta = await ventaRepository.getById(id, { session });

    if (!venta) {
      throw new AppError("Venta no encontrada", 404);
    }

    const nextProducts = Array.isArray(data?.products)
      ? data.products
      : venta.products.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }));

    validateProducts(nextProducts);

    const restoreIds = venta.products.map((item) => item.productId);
    const restoreProducts = await productoRepository.findByIds(restoreIds, {
      session,
    });

    if (restoreProducts.length !== restoreIds.length) {
      throw new AppError("Producto no encontrado", 404);
    }

    const restoreMap = buildProductMap(restoreProducts);

    for (const item of venta.products) {
      const producto = restoreMap.get(item.productId.toString());

      if (!producto) {
        throw new AppError("Producto no encontrado", 404);
      }

      await productoRepository.adjustStock(
        item.productId,
        Number(item.quantity),
        { session }
      );
    }

    const nextIds = nextProducts.map((item) => item.productId);
    const nextProductos = await productoRepository.findByIds(nextIds, {
      session,
    });

    if (nextProductos.length !== nextIds.length) {
      throw new AppError("Producto no encontrado", 404);
    }

    const nextMap = buildProductMap(nextProductos);

    for (const item of nextProducts) {
      const producto = nextMap.get(item.productId.toString());

      if (!producto) {
        throw new AppError("Producto no encontrado", 404);
      }

      if (producto.stock < Number(item.quantity)) {
        throw new AppError("Stock insuficiente", 400);
      }
    }

    for (const item of nextProducts) {
      await productoRepository.adjustStock(
        item.productId,
        -Number(item.quantity),
        { session }
      );
    }

    const totalAmount = calculateTotalAmount(nextProducts);

    return ventaRepository.updateById(
      id,
      {
        products: nextProducts,
        totalAmount,
        date: data?.date ?? venta.date,
      },
      { session }
    );
  });
};
