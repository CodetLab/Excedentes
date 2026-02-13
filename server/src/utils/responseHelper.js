// ==============================================
// RESPONSE HELPER - Respuestas normalizadas
// ==============================================

/**
 * Response estándar:
 * Success: { success: true, data: T, timestamp: number }
 * Error: { success: false, error: string, message?: string, timestamp: number }
 */

export const sendSuccess = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    timestamp: Date.now(),
  });
};

export const sendCreated = (res, data) => {
  return sendSuccess(res, data, 201);
};

export const sendError = (res, error, status = 400) => {
  const message = typeof error === "string" ? error : error.message || "Error desconocido";
  return res.status(status).json({
    success: false,
    error: message,
    message,
    timestamp: Date.now(),
  });
};

export const sendNotFound = (res, entity = "Recurso") => {
  return sendError(res, `${entity} no encontrado`, 404);
};

export const sendServerError = (res, error) => {
  console.error("[Server Error]", error);
  return sendError(res, error.message || "Error interno del servidor", 500);
};

export const sendValidationError = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: "Validación fallida",
    message: "Validación fallida",
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: Date.now(),
  });
};

export default {
  success: sendSuccess,
  created: sendCreated,
  error: sendError,
  notFound: sendNotFound,
  serverError: sendServerError,
  validationError: sendValidationError,
};
