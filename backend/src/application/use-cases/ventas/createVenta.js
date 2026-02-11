import { AppError } from "../../../shared/errors/AppError.js";
import { buildVenta } from "../../../domain/entities/Venta.js";
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

export const buildCreateVenta = ({
  ventaRepository,
  productoRepository,
  transactionRunner,
}) => async (data) => {
  const payload = buildVenta(data || {});
  validateProducts(payload.products);

  return transactionRunner(async (session) => {
    const ids = payload.products.map((item) => item.productId);
    const productos = await productoRepository.findByIds(ids, { session });

    if (productos.length !== ids.length) {
      throw new AppError("Producto no encontrado", 404);
    }

    const productosMap = buildProductMap(productos);

    for (const item of payload.products) {
      const producto = productosMap.get(item.productId.toString());

      if (!producto) {
        throw new AppError("Producto no encontrado", 404);
      }

      if (producto.stock < Number(item.quantity)) {
        throw new AppError("Stock insuficiente", 400);
      }
    }

    for (const item of payload.products) {
      await productoRepository.adjustStock(
        item.productId,
        -Number(item.quantity),
        { session }
      );
    }

    const totalAmount = calculateTotalAmount(payload.products);

    return ventaRepository.create(
      {
        products: payload.products,
        totalAmount,
        date: payload.date,
      },
      { session }
    );
  });
};
