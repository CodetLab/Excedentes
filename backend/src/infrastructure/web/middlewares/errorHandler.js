import AppError from '#errors/AppError.js'

export const errorHandler = (error, req, res, next) => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const payload = {
    message: error.message || "Error interno del servidor",
  };

  if (isAppError && error.details) {
    payload.errors = error.details;
  }

  res.status(statusCode).json(payload);
};
