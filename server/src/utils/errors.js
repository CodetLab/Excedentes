/**
 * Economic Error Types - v0.0.4
 * Errores económicos estructurados para Data Integrity & Economic Safety
 */

/**
 * Error base para errores económicos
 */
export class EconomicError extends Error {
  constructor(type, message, details = null) {
    super(message);
    this.name = "EconomicError";
    this.type = type;
    this.details = details;
    this.timestamp = Date.now();
  }

  toJSON() {
    return {
      success: false,
      error: this.type,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Error: Estado económico inválido
 * Se usa cuando las validaciones económicas fallan
 */
export class InvalidEconomicStateError extends EconomicError {
  constructor(message, details = null) {
    super("InvalidEconomicState", message, details);
    this.statusCode = 400;
  }
}

/**
 * Error: Período duplicado
 * Se usa cuando se intenta crear un período que ya existe
 */
export class DuplicatePeriodError extends EconomicError {
  constructor(companyId, month, year) {
    super(
      "DuplicatePeriod",
      "Ya existe un período cargado para esa empresa",
      { companyId, month, year }
    );
    this.statusCode = 409;
  }
}

/**
 * Error: Validación de datos
 * Se usa cuando los datos de entrada no pasan validaciones básicas
 */
export class ValidationError extends EconomicError {
  constructor(message, details = null) {
    super("ValidationError", message, details);
    this.statusCode = 400;
  }
}

/**
 * Error: Recurso no encontrado
 */
export class NotFoundError extends EconomicError {
  constructor(resource, identifier) {
    super("NotFound", `${resource} no encontrado`, { resource, identifier });
    this.statusCode = 404;
  }
}

/**
 * Error: Operación no permitida
 */
export class ForbiddenOperationError extends EconomicError {
  constructor(message, details = null) {
    super("ForbiddenOperation", message, details);
    this.statusCode = 403;
  }
}

/**
 * Constantes de errores económicos
 */
export const ECONOMIC_ERRORS = {
  NEGATIVE_SALES: "Las ventas no pueden ser negativas",
  NEGATIVE_COSTS: "Los costos fijos no pueden ser negativos",
  NEGATIVE_PROFIT: "La ganancia no puede ser negativa",
  SALES_LESS_THAN_PROFIT: "Las ventas no pueden ser menores que la ganancia",
  SALES_LESS_THAN_COSTS: "Las ventas no pueden ser menores que los costos fijos",
  INVALID_ECONOMIC_STATE: "Ventas no pueden ser menores que Ganancia + Costos Fijos",
  DUPLICATE_PERIOD: "Ya existe un período cargado para esa empresa",
};
