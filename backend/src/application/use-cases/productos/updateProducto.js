import { AppError } from "../../../shared/errors/AppError.js";

export const buildUpdateProducto = ({ productoRepository }) => async (id, data) => {
  const producto = await productoRepository.updateById(id, data);

  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  return producto;
};
