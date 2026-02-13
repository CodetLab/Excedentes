// ==============================================
// VALIDATORS - Validaciones centralizadas
// ==============================================

/**
 * Valida que un número sea positivo o cero
 */
export const validatePositiveNumber = (value, fieldName) => {
  if (value === undefined || value === null) return null;
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  if (num < 0) {
    return `${fieldName} debe ser >= 0`;
  }
  return null;
};

/**
 * Valida campos requeridos
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`${field} es requerido`);
    }
  }
  return errors.length > 0 ? errors : null;
};

/**
 * Valida payload de Capital
 */
export const validateCapitalPayload = (data) => {
  const errors = [];
  
  // Campo nombre siempre requerido
  if (!data.nombre || data.nombre.trim() === "") {
    errors.push("nombre es requerido");
  }
  
  // Validar campos monetarios
  const monetaryFields = ["valorUSD", "costoUSD", "salarioMensual", "salarioMensualUSD"];
  for (const field of monetaryFields) {
    const error = validatePositiveNumber(data[field], field);
    if (error) errors.push(error);
  }
  
  return errors.length > 0 ? errors : null;
};

/**
 * Valida payload de Personal
 */
export const validatePersonalPayload = (data) => {
  const errors = [];
  
  if (!data.nombre || data.nombre.trim() === "") {
    errors.push("nombre es requerido");
  }
  
  const monetaryFields = ["salarioMensualUSD", "cargosSocialesUSD", "costoMensualUSD"];
  for (const field of monetaryFields) {
    const error = validatePositiveNumber(data[field], field);
    if (error) errors.push(error);
  }
  
  return errors.length > 0 ? errors : null;
};

/**
 * Valida payload de Extras
 */
export const validateExtrasPayload = (data) => {
  const errors = [];
  
  if (!data.nombre || data.nombre.trim() === "") {
    errors.push("nombre es requerido");
  }
  
  const error = validatePositiveNumber(data.montoMensualUSD, "montoMensualUSD");
  if (error) errors.push(error);
  
  return errors.length > 0 ? errors : null;
};

export default {
  positiveNumber: validatePositiveNumber,
  requiredFields: validateRequiredFields,
  capitalPayload: validateCapitalPayload,
  personalPayload: validatePersonalPayload,
  extrasPayload: validateExtrasPayload,
};
