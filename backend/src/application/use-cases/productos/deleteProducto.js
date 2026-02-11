import { AppError } from "../../../shared/errors/AppError.js";

export const buildDeleteProducto = ({ productoRepository }) => async (id) => {
  const producto = await productoRepository.deleteById(id);

  if (!producto) {
    throw new AppError("Producto no encontrado", 404);
  }

  return producto;
};
