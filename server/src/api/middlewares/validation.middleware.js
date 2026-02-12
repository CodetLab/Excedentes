/**
 * Middleware de validación de schemas
 * Valida requests contra un schema definido
 */

/**
 * Schema de validación para POST /calculate
 */
export const calculateSchema = {
  sales: {
    type: "number",
    required: true,
    min: 0,
    message: "sales debe ser un número >= 0",
  },
  fixedCapitalCosts: {
    type: "number",
    required: false,
    min: 0,
    default: 0,
    message: "fixedCapitalCosts debe ser un número >= 0",
  },
  fixedLaborCosts: {
    type: "number",
    required: false,
    min: 0,
    default: 0,
    message: "fixedLaborCosts debe ser un número >= 0",
  },
  profit: {
    type: "number",
    required: false,
    min: 0,
    default: 0,
    message: "profit debe ser un número >= 0",
  },
  amortization: {
    type: "number",
    required: false,
    min: 0,
    default: 0,
    message: "amortization debe ser un número >= 0",
  },
  interests: {
    type: "number",
    required: false,
    min: 0,
    default: 0,
    message: "interests debe ser un número >= 0",
  },
  period: {
    type: "string",
    required: false,
    default: "Current",
  },
  currency: {
    type: "enum",
    values: ["USD", "ARS", "EUR"],
    required: false,
    default: "USD",
  },
  inflationIndex: {
    type: "number",
    required: false,
    min: 0.001,
    default: 1,
    message: "inflationIndex debe ser mayor que 0",
  },
  accountingCriteria: {
    type: "enum",
    values: ["ACCRUAL", "CASH"],
    required: false,
    default: "ACCRUAL",
  },
  employees: {
    type: "array",
    required: false,
    default: [],
    itemSchema: {
      id: { type: "string", required: true },
      name: { type: "string", required: false },
      amount: { type: "number", required: false, min: 0 },
    },
  },
};

/**
 * Validar un valor contra su schema
 */
function validateField(value, schema, fieldName) {
  const errors = [];

  // Check required
  if (schema.required && (value === undefined || value === null)) {
    errors.push(`${fieldName} es requerido`);
    return errors;
  }

  // Si no está presente y no es requerido, usar default
  if (value === undefined || value === null) {
    return errors;
  }

  // Type validation
  switch (schema.type) {
    case "number":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        errors.push(`${fieldName} debe ser un número válido`);
      } else if (schema.min !== undefined && value < schema.min) {
        errors.push(schema.message || `${fieldName} debe ser >= ${schema.min}`);
      } else if (schema.max !== undefined && value > schema.max) {
        errors.push(`${fieldName} debe ser <= ${schema.max}`);
      }
      break;

    case "string":
      if (typeof value !== "string") {
        errors.push(`${fieldName} debe ser un string`);
      } else if (schema.minLength && value.length < schema.minLength) {
        errors.push(`${fieldName} debe tener al menos ${schema.minLength} caracteres`);
      } else if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`${fieldName} debe tener máximo ${schema.maxLength} caracteres`);
      }
      break;

    case "enum":
      if (!schema.values.includes(value)) {
        errors.push(`${fieldName} debe ser uno de: ${schema.values.join(", ")}`);
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        errors.push(`${fieldName} debe ser un array`);
      } else if (schema.itemSchema) {
        value.forEach((item, index) => {
          Object.keys(schema.itemSchema).forEach((key) => {
            const itemErrors = validateField(item[key], schema.itemSchema[key], `${fieldName}[${index}].${key}`);
            errors.push(...itemErrors);
          });
        });
      }
      break;
  }

  return errors;
}

/**
 * Middleware factory para validar request body
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    // Validar cada campo del schema
    Object.keys(schema).forEach((fieldName) => {
      const fieldSchema = schema[fieldName];
      const value = req.body[fieldName];
      const fieldErrors = validateField(value, fieldSchema, fieldName);
      errors.push(...fieldErrors);

      // Aplicar default si no está presente
      if ((value === undefined || value === null) && fieldSchema.default !== undefined) {
        req.body[fieldName] = fieldSchema.default;
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "ValidationError",
        message: "Validación fallida",
        details: errors,
        timestamp: Date.now(),
      });
    }

    next();
  };
}

/**
 * Middleware para validar ObjectId de MongoDB
 */
export function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        error: "InvalidId",
        message: `${paramName} inválido`,
        timestamp: Date.now(),
      });
    }
    next();
  };
}
