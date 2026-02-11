import { AppError } from "../../../shared/errors/AppError.js";

export const buildUpdateCosto = ({ costoRepository }) => async (id, data) => {
  const costo = await costoRepository.updateById(id, data);

  if (!costo) {
    throw new AppError("Costo no encontrado", 404);
  }

  return costo;
};
