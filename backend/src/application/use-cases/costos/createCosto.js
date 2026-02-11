import AppError from '#errors/AppError.js'
import { buildCosto } from "../../../domain/entities/Costo.js";

const isEmpty = (value) => value === undefined || value === null || value === "";

export const buildCreateCosto = ({ costoRepository }) => async (data) => {
  const payload = buildCosto(data || {});

  if (
    isEmpty(payload.nombre) ||
    isEmpty(payload.etiqueta) ||
    isEmpty(payload.monto) ||
    isEmpty(payload.tipo)
  ) {
    throw new AppError("Datos invalidos", 400);
  }

  if (!Number.isFinite(Number(payload.monto))) {
    throw new AppError("Datos invalidos", 400);
  }

  if (!["FIJO", "VARIABLE"].includes(payload.tipo)) {
    throw new AppError("Datos invalidos", 400);
  }

  return costoRepository.create(payload);
};
