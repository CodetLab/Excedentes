import { AppError } from "../../../shared/errors/AppError.js";

export const buildGetProductoById = ({ productoRepository }) => async (id) => {
  const producto = await productoRepository.getById(id);

  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  return producto;
};
