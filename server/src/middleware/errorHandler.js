/**
 * Global Error Handler - v0.0.4
 * Middleware central para captura, normalización y logging de errores
 */

import { EconomicError } from "../utils/errors.js";
import logger from "../utils/logger.js";

/**
 * Middleware global de errores
 * Captura todos los errores y normaliza la respuesta
 */
export function globalErrorHandler(err, req, res, next) {
  // Determinar status code
  let statusCode = err.statusCode || 500;
  let errorType = "InternalError";
  let message = "Error interno del servidor";
  let details = null;

  // Error económico estructurado
  if (err instanceof EconomicError) {
    statusCode = err.statusCode || 400;
    errorType = err.type;
    message = err.message;
    details = err.details;

    logger.economicError("API", errorType, message, details);
  }
  // Error de validación de Mongoose
  else if (err.name === "ValidationError") {
    statusCode = 400;
    errorType = "ValidationError";
    message = "Error de validación";
    details = Object.values(err.errors || {}).map((e) => e.message);

    logger.warn("API", "Mongoose validation error", { details });
  }
  // Error de cast (ID inválido)
  else if (err.name === "CastError") {
    statusCode = 400;
    errorType = "InvalidId";
    message = "ID inválido";

    logger.warn("API", "Cast error - invalid ID", { value: err.value });
  }
  // Error de duplicado MongoDB
  else if (err.code === 11000) {
    statusCode = 409;
    errorType = "DuplicateRecord";
    message = "Registro duplicado";
    details = err.keyValue;

    logger.warn("API", "Duplicate record error", { keyValue: err.keyValue });
  }
  // Error con validationErrors (del servicio de cálculo)
  else if (err.validationErrors) {
    statusCode = 400;
    errorType = "ValidationError";
    message = err.message || "Validación fallida";
    details = err.validationErrors;

    logger.warn("API", "Validation error from service", { details });
  }
  // Error genérico
  else {
    // Solo loggear el stack en errores internos no controlados
    logger.error("API", "Unhandled error", {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });

    // No exponer detalles internos en producción
    if (process.env.NODE_ENV === "production") {
      message = "Error interno del servidor";
    } else {
      message = err.message || message;
    }
  }

  // Respuesta normalizada
  res.status(statusCode).json({
    success: false,
    error: errorType,
    message,
    details: details || undefined,
    timestamp: Date.now(),
  });
}

/**
 * Middleware para capturar rutas no encontradas
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "NotFound",
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    timestamp: Date.now(),
  });
}

/**
 * Wrapper para async handlers - captura errores y los pasa al error handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export default globalErrorHandler;
