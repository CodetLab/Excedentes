import mongoose from "mongoose";
import Producto from "../../../models/ProductoModel.js";
import Venta from "../../../models/VentaModel.js";
import { ServiceError } from "../../../utils/serviceError.js";

const validateVentaProducts = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    throw new ServiceError("Productos requeridos", 400);
  }

  for (const item of products) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ServiceError("Cantidad invalida", 400);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new ServiceError("Precio unitario invalido", 400);
    }
  }
};

const loadProductos = async (products, session) => {
  const ids = products.map((item) => item.productId);
  const productos = await Producto.find({ _id: { $in: ids } }).session(session);

  if (productos.length !== ids.length) {
    throw new ServiceError("Producto no encontrado", 404);
  }

  return new Map(productos.map((producto) => [producto._id.toString(), producto]));
};

const applyStockChange = async (products, productMap, delta, session) => {
  for (const item of products) {
    const productId = item.productId.toString();
    const producto = productMap.get(productId);
    const quantity = Number(item.quantity);

    if (!producto) {
      throw new ServiceError("Producto no encontrado", 404);
    }

    if (delta < 0 && producto.stock < quantity) {
      throw new ServiceError("Stock insuficiente", 400);
    }

    producto.stock += delta * quantity;
    await producto.save({ session });
  }
};

const calculateTotalAmount = (products) => {
  return products.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.unitPrice),
    0
  );
};

export const getVentas = async () => {
  try {
    return await Venta.find();
  } catch (error) {
    throw new ServiceError("Error al obtener ventas", 500, error);
  }
};

export const getVentaById = async (id) => {
  try {
    const venta = await Venta.findById(id);

    if (!venta) {
      throw new ServiceError("Venta no encontrada", 404);
    }

    return venta;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al obtener venta", 500, error);
  }
};

export const createVenta = async (data) => {
  let session;

  try {
    const { products, date } = data;
    validateVentaProducts(products);

    session = await mongoose.startSession();
    let nuevaVenta;

    await session.withTransaction(async () => {
      const productMap = await loadProductos(products, session);
      await applyStockChange(products, productMap, -1, session);
      const totalAmount = calculateTotalAmount(products);

      const [venta] = await Venta.create(
        [{ products, totalAmount, date }],
        { session }
      );

      nuevaVenta = venta;
    });

    return nuevaVenta;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al crear venta", 500, error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const updateVenta = async (id, data) => {
  let session;

  try {
    session = await mongoose.startSession();
    let ventaActualizada;

    await session.withTransaction(async () => {
      const venta = await Venta.findById(id).session(session);

      if (!venta) {
        throw new ServiceError("Venta no encontrada", 404);
      }

      const nextProducts = Array.isArray(data.products)
        ? data.products
        : venta.products.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }));

      validateVentaProducts(nextProducts);

      const restoreMap = await loadProductos(venta.products, session);
      await applyStockChange(venta.products, restoreMap, 1, session);

      const newMap = await loadProductos(nextProducts, session);
      await applyStockChange(nextProducts, newMap, -1, session);

      venta.products = nextProducts;
      venta.totalAmount = calculateTotalAmount(nextProducts);
      venta.date = data.date ?? venta.date;

      await venta.save({ session });
      ventaActualizada = venta;
    });

    return ventaActualizada;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al actualizar venta", 500, error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

export const deleteVenta = async (id) => {
  let session;

  try {
    session = await mongoose.startSession();
    let ventaEliminada;

    await session.withTransaction(async () => {
      const venta = await Venta.findById(id).session(session);

      if (!venta) {
        throw new ServiceError("Venta no encontrada", 404);
      }

      const restoreMap = await loadProductos(venta.products, session);
      await applyStockChange(venta.products, restoreMap, 1, session);

      await venta.deleteOne({ session });
      ventaEliminada = venta;
    });

    return ventaEliminada;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError("Error al eliminar venta", 500, error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
