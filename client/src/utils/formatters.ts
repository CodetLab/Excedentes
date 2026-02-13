/**
 * Utilidades de formateo seguras - nunca lanzan errores
 * Blindadas contra undefined, null, strings, NaN
 */

/**
 * Convierte cualquier valor a número de manera segura
 */
export function toSafeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

/**
 * Formatea un número con separadores de miles
 * @param value - Valor a formatear
 * @param fallback - Texto a mostrar si el valor no es válido (default: "-")
 */
export function safeNumber(value: any, fallback: string = "-"): string {
  const num = toSafeNumber(value);
  if (num === 0 && (value === null || value === undefined)) return fallback;
  return num.toLocaleString("es-AR");
}

/**
 * Formatea un valor como moneda (USD)
 * @param value - Valor a formatear
 * @param fallback - Texto a mostrar si el valor no es válido (default: "-")
 */
export function safeCurrency(value: any, fallback: string = "-"): string {
  const num = toSafeNumber(value);
  if (num === 0 && (value === null || value === undefined)) return fallback;
  return `$${num.toLocaleString("es-AR")}`;
}

/**
 * Formatea un valor como porcentaje
 * @param value - Valor a formatear (0.15 = 15%)
 * @param decimals - Decimales a mostrar (default: 1)
 * @param fallback - Texto a mostrar si el valor no es válido (default: "-")
 */
export function safePercent(value: any, decimals: number = 1, fallback: string = "-"): string {
  const num = toSafeNumber(value);
  if (num === 0 && (value === null || value === undefined)) return fallback;
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Formatea un valor como porcentaje directo (sin multiplicar por 100)
 * @param value - Valor a formatear (15 = 15%)
 * @param decimals - Decimales a mostrar (default: 1)
 * @param fallback - Texto a mostrar si el valor no es válido (default: "-")
 */
export function safePercentDirect(value: any, decimals: number = 1, fallback: string = "-"): string {
  const num = toSafeNumber(value);
  if (num === 0 && (value === null || value === undefined)) return fallback;
  return `${num.toFixed(decimals)}%`;
}

/**
 * Formatea una fecha de manera segura
 * @param value - Fecha a formatear (Date, string, number)
 * @param fallback - Texto a mostrar si el valor no es válido (default: "-")
 */
export function safeDate(value: any, fallback: string = "-"): string {
  if (!value) return fallback;
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleString("es-AR");
  } catch {
    return fallback;
  }
}

/**
 * Formatea cualquier valor como string seguro
 * @param value - Valor a formatear
 * @param fallback - Texto a mostrar si el valor es null/undefined (default: "-")
 */
export function safeString(value: any, fallback: string = "-"): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}
