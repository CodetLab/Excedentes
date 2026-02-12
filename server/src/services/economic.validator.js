/**
 * Economic Validator - v0.0.4
 * Validaciones económicas obligatorias antes de ejecutar cálculos
 */

import { InvalidEconomicStateError, ECONOMIC_ERRORS } from "../utils/errors.js";

/**
 * Validar estado económico antes de calcular
 * Aplica todas las reglas de integridad económica
 * 
 * @param {Object} data - Datos económicos a validar
 * @param {number} data.sales - Ventas
 * @param {number} data.fixedCapitalCosts - Costos fijos de capital
 * @param {number} data.fixedLaborCosts - Costos fijos de trabajo
 * @param {number} data.profit - Ganancia
 * @throws {InvalidEconomicStateError} Si alguna validación falla
 */
export function validateEconomicState(data) {
  const {
    sales = 0,
    fixedCapitalCosts = 0,
    fixedLaborCosts = 0,
    profit = 0,
  } = data;

  const errors = [];

  // 1. Ventas >= 0
  if (sales < 0) {
    errors.push({
      field: "sales",
      rule: "NON_NEGATIVE",
      message: ECONOMIC_ERRORS.NEGATIVE_SALES,
      value: sales,
    });
  }

  // 2. Costos fijos >= 0
  if (fixedCapitalCosts < 0) {
    errors.push({
      field: "fixedCapitalCosts",
      rule: "NON_NEGATIVE",
      message: ECONOMIC_ERRORS.NEGATIVE_COSTS,
      value: fixedCapitalCosts,
    });
  }

  if (fixedLaborCosts < 0) {
    errors.push({
      field: "fixedLaborCosts",
      rule: "NON_NEGATIVE",
      message: ECONOMIC_ERRORS.NEGATIVE_COSTS,
      value: fixedLaborCosts,
    });
  }

  // 3. Ganancia >= 0
  if (profit < 0) {
    errors.push({
      field: "profit",
      rule: "NON_NEGATIVE",
      message: ECONOMIC_ERRORS.NEGATIVE_PROFIT,
      value: profit,
    });
  }

  // Si hay errores básicos, lanzar antes de validar relaciones
  if (errors.length > 0) {
    throw new InvalidEconomicStateError(
      errors[0].message,
      { validationErrors: errors }
    );
  }

  const totalFixedCosts = fixedCapitalCosts + fixedLaborCosts;

  // 4. Ventas >= Ganancia
  if (sales < profit) {
    throw new InvalidEconomicStateError(
      ECONOMIC_ERRORS.SALES_LESS_THAN_PROFIT,
      {
        sales,
        profit,
        difference: profit - sales,
      }
    );
  }

  // 5. Ventas >= Costos Fijos
  if (sales < totalFixedCosts) {
    throw new InvalidEconomicStateError(
      ECONOMIC_ERRORS.SALES_LESS_THAN_COSTS,
      {
        sales,
        totalFixedCosts,
        difference: totalFixedCosts - sales,
      }
    );
  }

  // 6. Ventas >= Ganancia + Costos Fijos (estado válido)
  const minimumRequired = profit + totalFixedCosts;
  if (sales < minimumRequired) {
    throw new InvalidEconomicStateError(
      ECONOMIC_ERRORS.INVALID_ECONOMIC_STATE,
      {
        sales,
        profit,
        totalFixedCosts,
        minimumRequired,
        deficit: minimumRequired - sales,
      }
    );
  }

  return true;
}

/**
 * Validar datos numéricos básicos
 * @param {Object} data - Datos a validar
 * @param {string[]} fields - Campos requeridos
 * @throws {InvalidEconomicStateError} Si algún campo es inválido
 */
export function validateNumericFields(data, fields) {
  const errors = [];

  for (const field of fields) {
    const value = data[field];
    
    if (value === undefined || value === null) {
      continue; // Campo opcional, se manejará con defaults
    }

    if (typeof value !== "number" || !Number.isFinite(value)) {
      errors.push({
        field,
        rule: "NUMERIC",
        message: `${field} debe ser un número válido`,
        value,
      });
    }
  }

  if (errors.length > 0) {
    throw new InvalidEconomicStateError(
      "Datos numéricos inválidos",
      { validationErrors: errors }
    );
  }

  return true;
}

/**
 * Validar y sanitizar input completo para cálculo
 * @param {Object} input - Input del usuario
 * @returns {Object} Input sanitizado y validado
 */
export function validateAndSanitizeCalculationInput(input) {
  // Primero validar que sean números válidos
  validateNumericFields(input, [
    "sales",
    "fixedCapitalCosts",
    "fixedLaborCosts",
    "profit",
    "amortization",
    "interests",
    "inflationIndex",
  ]);

  // Sanitizar con defaults
  const sanitized = {
    sales: Number(input.sales) || 0,
    fixedCapitalCosts: Number(input.fixedCapitalCosts) || 0,
    fixedLaborCosts: Number(input.fixedLaborCosts) || 0,
    profit: Number(input.profit) || 0,
    amortization: Number(input.amortization) || 0,
    interests: Number(input.interests) || 0,
    period: input.period || "Current",
    currency: input.currency || "USD",
    inflationIndex: Number(input.inflationIndex) || 1,
    accountingCriteria: input.accountingCriteria || "ACCRUAL",
    employees: Array.isArray(input.employees) ? input.employees : [],
  };

  // Validar estado económico
  validateEconomicState(sanitized);

  return sanitized;
}

export default {
  validateEconomicState,
  validateNumericFields,
  validateAndSanitizeCalculationInput,
};
