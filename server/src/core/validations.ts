// Verificaciones de seguridad adicionales para el core engine

import { EngineInput } from "./types.js";

/**
 * Valida que no haya divisiones por cero o condiciones peligrosas
 * antes de ejecutar cálculos económicos
 */
export function validateSafeCalculations(input: EngineInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 1. Verificar que costos fijos totales no sean cero (evita división por cero en weights)
  const totalFixed = input.FixedCapitalCosts + input.FixedLaborCosts;
  if (totalFixed <= 0) {
    errors.push("Los costos fijos totales deben ser mayores a cero");
  }

  // 2. Verificar que ventas no sean menores a costos fijos (economía básica)
  if (input.Sales < totalFixed) {
    errors.push(
      `Las ventas (${input.Sales}) no pueden ser menores a los costos fijos (${totalFixed})`
    );
  }

  // 3. Verificar que no haya valores negativos
  const monetaryFields = [
    { name: "Sales", value: input.Sales },
    { name: "FixedCapitalCosts", value: input.FixedCapitalCosts },
    { name: "FixedLaborCosts", value: input.FixedLaborCosts },
    { name: "Profit", value: input.Profit },
    { name: "Amortization", value: input.Amortization },
    { name: "Interests", value: input.Interests },
  ];

  for (const field of monetaryFields) {
    if (field.value < 0) {
      errors.push(`${field.name} no puede ser negativo: ${field.value}`);
    }
  }

  // 4. Verificar que InflationIndex sea válido (evita multiplicaciones/divisiones incorrectas)
  if (input.InflationIndex <= 0) {
    errors.push(
      `InflationIndex debe ser mayor a cero: ${input.InflationIndex}`
    );
  }

  // 5. Verificar que no haya NaN o Infinity
  const allNumericValues = [
    input.Sales,
    input.FixedCapitalCosts,
    input.FixedLaborCosts,
    input.Profit,
    input.Amortization,
    input.Interests,
    input.InflationIndex,
  ];

  for (const value of allNumericValues) {
    if (!Number.isFinite(value)) {
      errors.push(`Valor numérico inválido detectado: ${value}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Valida que el margen de contribución no sea cero o negativo
 * (para evitar punto de equilibrio indefinido o negativo)
 */
export function validateContributionMargin(
  sales: number,
  variableCosts: number
): { isValid: boolean; contributionMargin: number } {
  const contributionMargin = sales - variableCosts;

  return {
    isValid: contributionMargin > 0,
    contributionMargin,
  };
}

/**
 * Calcula el punto de equilibrio TRADICIONAL (opcional)
 * Solo para referencia, no se usa en el motor principal
 * 
 * Fórmula: PE = Costos Fijos / (1 - (Costos Variables / Ventas))
 */
export function calculateTraditionalBreakEven(
  fixedCosts: number,
  sales: number,
  variableCosts: number
): number | null {
  if (sales <= 0) return null;
  
  const variableCostRatio = variableCosts / sales;
  
  // Si el ratio es >= 1, significa que no hay margen de contribución
  if (variableCostRatio >= 1) return null;
  
  const contributionMarginRatio = 1 - variableCostRatio;
  
  if (contributionMarginRatio <= 0) return null;
  
  return fixedCosts / contributionMarginRatio;
}
