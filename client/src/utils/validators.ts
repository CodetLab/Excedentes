/**
 * validators.ts
 * 
 * Validaciones económicas para el flujo de cálculo.
 * Dos niveles: Existencia e Integridad.
 * 
 * NO hace cálculos. Solo evalúa precondiciones.
 */

import type { PeriodSummary } from "../services/dashboard.service";

export interface ValidationResult {
  /** Indica si la validación pasó completamente */
  valid: boolean;

  /** Problemas que bloquean el flujo (MUST FIX) */
  blockingIssues: string[];

  /** Advertencias no bloqueantes (NICE TO FIX) */
  warnings: string[];

  /** Resumen legible para mostrar al usuario */
  summary: string;
}

/**
 * NIVEL 1 — Validar existencia de datos mínimos
 * @param summary Datos del período desde el dashboard
 * @returns Problemas bloqueantes por falta de datos
 */
function validateExistence(summary: PeriodSummary | null): string[] {
  const issues: string[] = [];

  if (!summary) {
    issues.push("No hay datos cargados para el período seleccionado");
    return issues;
  }

  // ¿Hay capital?
  if (summary.totalCapital === 0 || summary.details.capitalItemsCount === 0) {
    issues.push("No hay activos de capital cargados. Completa la sección Capital.");
  }

  // ¿Hay personal?
  if (summary.totalPersonal === 0 || summary.details.empleadosCount === 0) {
    issues.push(
      "No hay personal cargado. Completa la sección Personal."
    );
  }

  // ¿Hay ventas?
  if (summary.sales === 0 || summary.details.ventasCount === 0) {
    issues.push("No hay ventas registradas. Completa la sección Ventas.");
  }

  // ¿Hay ganancia registrada?
  if (summary.profit === 0) {
    issues.push("Ganancia no registrada. Completa la sección Ganancias.");
  }

  return issues;
}

/**
 * NIVEL 2 — Validar integridad económica mínima
 * @param summary Datos del período
 * @returns Problemas bloqueantes por inconsistencia económica + advertencias
 */
function validateIntegrity(summary: PeriodSummary | null): {
  blockingIssues: string[];
  warnings: string[];
} {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];

  if (!summary) {
    return { blockingIssues, warnings };
  }

  // Integridad económica BLOQUEANTE

  // 1. Total salarios no puede ser negativo
  if (summary.totalPersonal < 0) {
    blockingIssues.push(
      "Total de salarios es negativo. Revisa los datos de personal."
    );
  }

  // 2. Total capital no puede ser negativo
  if (summary.totalCapital < 0) {
    blockingIssues.push(
      "Total de costos de capital es negativo. Revisa la sección Capital."
    );
  }

  // 3. Ventas no pueden ser negativas
  if (summary.sales < 0) {
    blockingIssues.push("Ventas negativas. Revisa la sección Ventas.");
  }

  // 4. Ganancia no puede ser negativa (para cálculos normales)
  if (summary.profit < 0) {
    blockingIssues.push(
      "Ganancia negativa. Esto implicaría pérdida. Revisa Ganancias."
    );
  }

  // 5. Validación lógica: Ventas >= Ganancia
  // (No siempre, pero es un check básico)
  if (summary.sales > 0 && summary.profit > summary.sales) {
    blockingIssues.push(
      "Ganancia mayor que ventas. Datos inconsistentes. Revisa Ganancias."
    );
  }

  // Advertencias NO bloqueantes

  // 1. Total costos muy alto respecto a ventas
  if (
    summary.sales > 0 &&
    summary.totalFixedCosts > summary.sales * 0.8
  ) {
    warnings.push(
      "⚠️ Los costos son muy altos (>80% de ventas). Posible margen muy bajo."
    );
  }

  // 2. Ganancia muy baja respecto a ventas
  if (
    summary.sales > 0 &&
    summary.profit < summary.sales * 0.05
  ) {
    warnings.push(
      "⚠️ Ganancia muy baja (<5% de ventas). Verifica balances."
    );
  }

  // 3. Más advertencia: Sin extras pero hay datos
  if (
    summary.totalCapital > 0 &&
    summary.totalPersonal > 0 &&
    summary.totalExtras === 0
  ) {
    warnings.push(
      "ℹ️ Sin gastos extras registrados. Asegúrate de incluirlos si aplica."
    );
  }

  return { blockingIssues, warnings };
}

/**
 * VALIDACIÓN PRINCIPAL
 * 
 * Ejecuta Nivel 1 (Existencia) + Nivel 2 (Integridad).
 * Si pasa Nivel 1 → evalúa Nivel 2.
 * Si falla Nivel 1 → no evalúa Nivel 2.
 * 
 * @param summary Datos consolidados del período
 * @returns Resultado de validación con issues y warnings
 */
export function validateEconomicPreconditions(
  summary: PeriodSummary | null
): ValidationResult {
  const existenceIssues = validateExistence(summary);

  // Si falla existencia → bloquear, no continuar a integridad
  if (existenceIssues.length > 0) {
    return {
      valid: false,
      blockingIssues: existenceIssues,
      warnings: [],
      summary: `❌ Datos incompletos (${existenceIssues.length} secciones faltantes).`,
    };
  }

  // Si pasó existencia → evaluar integridad
  const { blockingIssues, warnings } = validateIntegrity(summary);

  // Si hay problemas de integridad → bloquear
  if (blockingIssues.length > 0) {
    return {
      valid: false,
      blockingIssues,
      warnings,
      summary: `❌ Datos inconsistentes (${blockingIssues.length} problemas económicos).`,
    };
  }

  // Si hay advertencias pero sin bloqueos → permitir pero informar
  return {
    valid: true,
    blockingIssues: [],
    warnings,
    summary:
      warnings.length > 0
        ? `✅ Datos válidos, pero con ${warnings.length} advertencia(s).`
        : "✅ Datos válidos. Listo para calcular.",
  };
}
