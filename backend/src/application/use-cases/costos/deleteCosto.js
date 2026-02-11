import { AppError } from "../../../shared/errors/AppError.js";

export const buildDeleteCosto = ({ costoRepository }) => async (id) => {
  const costo = await costoRepository.deleteById(id);

  if (!costo) {
    throw new AppError("Costo no encontrado", 404);
  }

  return costo;
};
