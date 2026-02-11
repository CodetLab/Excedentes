import { AppError } from "../../../shared/errors/AppError.js";

export const buildGetVentaById = ({ ventaRepository }) => async (id) => {
  const venta = await ventaRepository.getById(id);

  if (!venta) {
    throw new AppError("Venta no encontrada", 404);
  }

  return venta;
};
