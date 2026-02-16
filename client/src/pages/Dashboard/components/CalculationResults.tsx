/**
 * CalculationResults.tsx
 * 
 * Componente de presentación PURA.
 * 
 * Responsabilidades:
 * ✅ Renderizar resultado de cálculo
 * ✅ Mostrar tabla de distribución laboral
 * ✅ Visualizar estado económico
 * 
 * Prohibiciones:
 * ❌ NO llama APIs
 * ❌ NO recalcula
 * ❌ NO muta estado
 * ❌ NO tiene state interno
 * 
 * Reutilizable en:
 * - Dashboard
 * - Reportes
 * - Vista pública
 * - Exportación
 */

import type { CalculateResult } from "../../../services/apiTypes";
import { buildCalculationViewModel } from "../../../utils/calculationViewModel";
import { safeCurrency, safeDate } from "../../../utils/formatters";
import Card from "../../../components/Card";
import "../styles/CalculationResults.css";

interface CalculationResultsProps {
  /** Resultado del cálculo backend (snapshot congelado) */
  snapshot: CalculateResult | null;

  /** Mostrar estado de carga */
  isLoading?: boolean;

  /** Mostrar estado de error */
  hasError?: boolean;

  /** Mensaje de error si aplica */
  errorMessage?: string;
}

export default function CalculationResults({
  snapshot,
  isLoading = false,
  hasError = false,
  errorMessage,
}: CalculationResultsProps) {
  // Validar entrada
  if (isLoading) {
    return (
      <div className="calculation-results loading">
        <div className="loading-spinner">
          <p>Calculando...</p>
        </div>
      </div>
    );
  }

  if (hasError || !snapshot) {
    return (
      <div className="calculation-results error">
        <Card className="error-card">
          <div className="error-content">
            <h3>Error en el cálculo</h3>
            <p>{errorMessage || "Hubo un problema al procesar el cálculo."}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Construir ViewModel (transformación pura, no es cálculo)
  const viewModel = buildCalculationViewModel(snapshot);

  return (
    <div className="calculation-results results-section">
      {/* Estado Económico */}
      <Card
        className={`status-card status-${viewModel.economicStatus.toLowerCase()}`}
      >
        <div className="status-content">
          <div className="status-header">
            <span className="status-label">Estado Económico</span>
            <span
              className={`status-badge status-${viewModel.economicStatus.toLowerCase()}`}
            >
              {viewModel.statusMessage}
            </span>
          </div>
          <div className="status-breakdown">
            <div className="status-item">
              <span className="status-item-label">Resultado</span>
              <span
                className={`status-item-value ${viewModel.economicStatus.toLowerCase()}`}
              >
                {safeCurrency(viewModel.distributableSurplus)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPIs Principales */}
      <div className="kpi-grid">
        <Card className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Punto de Equilibrio</span>
            <span className="kpi-value">
              {safeCurrency(viewModel.breakEvenPoint)}
            </span>
            <span className="kpi-helper">Costos Fijos Totales</span>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Ingresos Totales</span>
            <span className="kpi-value">
              {safeCurrency(viewModel.totalAssets)}
            </span>
            <span className="kpi-helper">Ventas Consolidadas</span>
          </div>
        </Card>

        <Card className="kpi-card">
          <div className="kpi-content">
            <span className="kpi-label">Excedente Distribuible</span>
            <span
              className={`kpi-value ${
                viewModel.distributableSurplus >= 0 ? "positive" : "negative"
              }`}
            >
              {safeCurrency(viewModel.distributableSurplus)}
            </span>
            <span className="kpi-helper">Disponible para distribuir</span>
          </div>
        </Card>
      </div>

      {/* Composición de Costos */}
      <Card title="Composición de Costos">
        <div className="costs-breakdown">
          <table className="costs-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th className="text-right">Monto</th>
                <th className="text-right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Costos Capital (Fijos)</td>
                <td className="text-right">
                  {safeCurrency(viewModel.totalCapitalCosts)}
                </td>
                <td className="text-right">
                  {viewModel.breakEvenPoint > 0
                    ? (
                        (viewModel.totalCapitalCosts /
                          viewModel.breakEvenPoint) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </td>
              </tr>
              <tr>
                <td>Costos Trabajo (Salarios)</td>
                <td className="text-right">
                  {safeCurrency(viewModel.totalSalaries)}
                </td>
                <td className="text-right">
                  {viewModel.breakEvenPoint > 0
                    ? (
                        (viewModel.totalSalaries /
                          viewModel.breakEvenPoint) *
                        100
                      ).toFixed(1)
                    : "0"}
                  %
                </td>
              </tr>
              <tr className="total-row">
                <td>
                  <strong>Total Costos Fijos</strong>
                </td>
                <td className="text-right">
                  <strong>{safeCurrency(viewModel.breakEvenPoint)}</strong>
                </td>
                <td className="text-right">
                  <strong>100%</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Distribución Laboral */}
      {viewModel.laborDistribution.length > 0 && (
        <Card title="Distribución de Excedente por Trabajador">
          <div className="distribution-section">
            {!viewModel.isDistributionBalanced && (
              <div className="warning-banner">
                <span className="warning-icon">⚠️</span>
                <span>
                  Advertencia: Error de redondeo de {viewModel.balanceError.toFixed(2)}{" "}
                  {snapshot.input.currency}
                </span>
              </div>
            )}

            <div className="distribution-table-wrapper">
              <table className="distribution-table">
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th className="text-right">Salario Anual</th>
                    <th className="text-right">% Asignado</th>
                    <th className="text-right">Monto Recibido</th>
                  </tr>
                </thead>
                <tbody>
                  {viewModel.laborDistribution.map((row) => (
                    <tr key={row.employeeId} className="distribution-row">
                      <td className="employee-name">{row.employeeName}</td>
                      <td className="text-right">
                        {safeCurrency(row.baseSalary)}
                      </td>
                      <td className="text-right">
                        {row.salaryPercentage.toFixed(2)}%
                      </td>
                      <td className="text-right amount">
                        <strong>{safeCurrency(row.amountReceived)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td className="text-right">
                      <strong>{safeCurrency(viewModel.totalSalaries)}</strong>
                    </td>
                    <td className="text-right">
                      <strong>
                        {viewModel.distributionSumPercentage.toFixed(2)}%
                      </strong>
                    </td>
                    <td className="text-right amount">
                      <strong
                        className={
                          viewModel.isDistributionBalanced
                            ? "balanced"
                            : "unbalanced"
                        }
                      >
                        {safeCurrency(viewModel.distributionSumAmount)}
                      </strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="distribution-note">
              <p>
                <strong>Nota:</strong> El excedente se distribuye de forma
                proporcional al salario anual de cada trabajador.
              </p>
              {viewModel.isDistributionBalanced && (
                <p className="success">
                  ✅ Distribución coherente: suma exacta = {safeCurrency(
                    viewModel.distributableSurplus
                  )}
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Auditoría */}
      <Card title="Información de Auditoría">
        <div className="audit-info">
          <div className="audit-grid">
            <div className="audit-item">
              <span className="audit-label">Estado de Cálculo:</span>
              <span
                className={`audit-value status-${viewModel.auditStatus.toLowerCase()}`}
              >
                {viewModel.auditStatus === "PASS" ? "✅ VÁLIDO" : "❌ INVÁLIDO"}
              </span>
            </div>
            <div className="audit-item">
              <span className="audit-label">Calculado en:</span>
              <span className="audit-value">
                {safeDate(viewModel.calculatedAt)}
              </span>
            </div>
            <div className="audit-item">
              <span className="audit-label">Período:</span>
              <span className="audit-value">{viewModel.periodName}</span>
            </div>
            <div className="audit-item">
              <span className="audit-label">Moneda:</span>
              <span className="audit-value">{viewModel.currency}</span>
            </div>
            <div className="audit-item">
              <span className="audit-label">Empleados:</span>
              <span className="audit-value">{viewModel.employeeCount}</span>
            </div>
            <div className="audit-item">
              <span className="audit-label">Precisión:</span>
              <span className="audit-value">
                {viewModel.isDistributionBalanced ? "✅ Exacta" : "⚠️ Redondeo"}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
