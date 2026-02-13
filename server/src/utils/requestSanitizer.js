// ==============================================
// REQUEST SANITIZER - Normalización de datos
// ==============================================

/**
 * Convierte strings de números a números reales
 */
export const sanitizeNumbers = (data, numberFields) => {
  const result = { ...data };
  
  for (const field of numberFields) {
    if (result[field] !== undefined && result[field] !== null && result[field] !== "") {
      const num = Number(result[field]);
      result[field] = isNaN(num) ? 0 : num;
    }
  }
  
  return result;
};

/**
 * Elimina campos vacíos (null, undefined, "")
 */
export const removeEmptyFields = (data, preserveFields = []) => {
  const result = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (preserveFields.includes(key)) {
      result[key] = value;
    } else if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * Normaliza payload de Capital
 * - Convierte números
 * - Agrega defaults
 */
export const normalizeCapitalPayload = (data, tipo) => {
  const numberFields = [
    "valorUSD", "costoUSD", "cantidad", "superficie", 
    "anio", "salarioMensual", "salarioMensualUSD", 
    "cargosSocialesUSD", "stockActual", "stockMinimo",
    "montoMensualUSD", "montoAnualUSD"
  ];
  
  const sanitized = sanitizeNumbers(data, numberFields);
  
  return {
    nombre: sanitized.nombre || "",
    descripcion: sanitized.descripcion || "",
    valorUSD: sanitized.valorUSD || 0,
    costoUSD: sanitized.costoUSD || 0,
    cantidad: sanitized.cantidad || 1,
    activo: sanitized.activo !== false,
    ...sanitized,
    tipo: tipo.toUpperCase(),
  };
};

/**
 * Normaliza payload de Personal
 */
export const normalizePersonalPayload = (data, tipoPersonal) => {
  const numberFields = ["salarioMensualUSD", "cargosSocialesUSD", "costoMensualUSD", "salarioMensual"];
  const sanitized = sanitizeNumbers(data, numberFields);
  
  // Calcular costo total si aplica
  if (sanitized.salarioMensualUSD !== undefined) {
    sanitized.costoTotalMensualUSD = 
      (sanitized.salarioMensualUSD || 0) + (sanitized.cargosSocialesUSD || 0);
  }
  
  return {
    nombre: sanitized.nombre || "",
    activo: sanitized.activo !== false,
    ...sanitized,
    tipo: tipoPersonal,
  };
};

/**
 * Normaliza payload de Extras
 */
export const normalizeExtrasPayload = (data) => {
  const numberFields = ["montoMensualUSD", "montoAnualUSD", "montoUSD"];
  const sanitized = sanitizeNumbers(data, numberFields);
  
  // Calcular montoAnualUSD si no viene
  if (sanitized.montoMensualUSD && !sanitized.montoAnualUSD) {
    sanitized.montoAnualUSD = sanitized.montoMensualUSD * 12;
  }
  
  return {
    nombre: sanitized.nombre || "",
    esCostoFijo: sanitized.esCostoFijo !== false,
    activo: sanitized.activo !== false,
    ...sanitized,
    tipo: "EXTRAS",
  };
};

/**
 * Genera un userId temporal para desarrollo (sin auth)
 */
export const getOrCreateUserId = (req, body) => {
  // Si hay usuario autenticado, usar ese
  if (req.user?.id) return req.user.id;
  
  // Si viene en body (desarrollo), usar ese
  if (body.userId) return body.userId;
  
  // Para desarrollo: usar un ID fijo temporal
  // En producción esto debería fallar
  return process.env.NODE_ENV === "production" 
    ? null 
    : "000000000000000000000001";
};

export default {
  sanitizeNumbers,
  removeEmptyFields,
  normalizeCapitalPayload,
  normalizePersonalPayload,
  normalizeExtrasPayload,
  getOrCreateUserId,
};
