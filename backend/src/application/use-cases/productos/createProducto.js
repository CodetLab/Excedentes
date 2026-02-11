import { AppError } from "../../../shared/errors/AppError.js";
import { buildProducto } from "../../../domain/entities/Producto.js";

const isEmpty = (value) => value === undefined || value === null || value === "";

export const buildCreateProducto = ({ productoRepository }) => async (data) => {
  const payload = buildProducto(data || {});

  if (isEmpty(payload.name) || isEmpty(payload.price) || isEmpty(payload.cost)) {
    throw new AppError("Datos invalidos", 400);
  }

  if (!Number.isFinite(Number(payload.price)) || !Number.isFinite(Number(payload.cost))) {
    throw new AppError("Datos invalidos", 400);
  }

  return productoRepository.create(payload);
};
