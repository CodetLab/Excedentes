/**
 * Response Helpers - v0.0.4
 * Funciones para normalizar respuestas de la API
 */

/**
 * Crear respuesta exitosa normalizada
 * @param {any} data - Datos a retornar
 * @param {number} statusCode - Código HTTP (default: 200)
 * @returns {Object} Respuesta normalizada
 */
export function successResponse(data, statusCode = 200) {
  return {
    statusCode,
    body: {
      success: true,
      data,
      timestamp: Date.now(),
    },
  };
}

/**
 * Crear respuesta de error normalizada
 * @param {string} errorType - Tipo de error
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP (default: 400)
 * @param {any} details - Detalles adicionales
 * @returns {Object} Respuesta de error normalizada
 */
export function errorResponse(errorType, message, statusCode = 400, details = null) {
  const body = {
    success: false,
    error: errorType,
    message,
    timestamp: Date.now(),
  };

  if (details !== null && details !== undefined) {
    body.details = details;
  }

  return {
    statusCode,
    body,
  };
}

/**
 * Enviar respuesta exitosa directamente al response de Express
 * @param {Response} res - Express response object
 * @param {any} data - Datos a retornar
 * @param {number} statusCode - Código HTTP (default: 200)
 */
export function sendSuccess(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: Date.now(),
  });
}

/**
 * Enviar respuesta de error directamente al response de Express
 * @param {Response} res - Express response object
 * @param {string} errorType - Tipo de error
 * @param {string} message - Mensaje de error
 * @param {number} statusCode - Código HTTP (default: 400)
 * @param {any} details - Detalles adicionales
 */
export function sendError(res, errorType, message, statusCode = 400, details = null) {
  const body = {
    success: false,
    error: errorType,
    message,
    timestamp: Date.now(),
  };

  if (details !== null && details !== undefined) {
    body.details = details;
  }

  return res.status(statusCode).json(body);
}

/**
 * Crear respuesta de creación exitosa (201)
 */
export function createdResponse(data) {
  return successResponse(data, 201);
}

/**
 * Enviar respuesta de creación exitosa (201)
 */
export function sendCreated(res, data) {
  return sendSuccess(res, data, 201);
}

/**
 * Enviar Sin Contenido (204)
 */
export function sendNoContent(res) {
  return res.status(204).send();
}

export default {
  successResponse,
  errorResponse,
  sendSuccess,
  sendError,
  createdResponse,
  sendCreated,
  sendNoContent,
};
