import type { CalculateResult } from "../../services/apiTypes";
import { getEconomicStatus } from "../../services/apiTypes";
import EconomicStatusCard from "./EconomicStatusCard";
import BreakEvenChart from "./BreakEvenChart";
import SurplusDistributionChart from "./SurplusDistributionChart";
import styles from "../../styles/CalculationDashboard.module.css";

export interface CalculationDashboardProps {
  result: CalculateResult;
  onBack?: () => void;
}

/**
 * 📊 Componente CalculationDashboard
 * 
 * Visualiza los resultados del cálculo económico
 * Incluye:
 * - Estado económico (Pérdida / Equilibrio / Excedente)
 * - Gráfico de punto de equilibrio
 * - Distribución de excedente (Capital vs Trabajo)
 * - Detalles del cálculo
 */
export default function CalculationDashboard({
  result,
  onBack,
}: CalculationDashboardProps) {
  const status = getEconomicStatus(result.surplus);
  const breakEven = result.breakEven;
  const revenue = result.totalRevenue;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>📈 Resultados del Cálculo Económico</h1>
        {onBack && (
          <button className={styles.backButton} onClick={onBack}>
            ← Volver
          </button>
        )}
      </div>

      {/* Estado económico principal */}
      <EconomicStatusCard
        status={status}
        surplus={result.surplus}
        revenue={revenue}
        breakEven={breakEven}
      />

      <div className={styles.chartsGrid}>
        {/* Gráfico de punto de equilibrio */}
        <div className={styles.chartContainer}>
          <h2>📊 Análisis de Punto de Equilibrio</h2>
          <BreakEvenChart breakEven={breakEven} revenue={revenue} />
        </div>

        {/* Gráfico de distribución */}
        {result.surplus > 0 && (
          <div className={styles.chartContainer}>
            <h2>💰 Distribución del Excedente</h2>
            <SurplusDistributionChart distribution={result.distribution} />
          </div>
        )}
      </div>

      {/* Detalles del cálculo */}
      <section className={styles.details}>
        <h2>📋 Detalles del Cálculo</h2>

        <div className={styles.detailsGrid}>
          {/* Ingresos y costos */}
          <div className={styles.detailCard}>
            <h3>💵 Flujos Económicos</h3>
            <dl>
              <dt>Ingresos Totales:</dt>
              <dd>${result.input.sales.toFixed(2)}</dd>

              <dt>Ganancia Neta:</dt>
              <dd>${result.input.profit.toFixed(2)}</dd>

              <dt>Costos Fijos Capital:</dt>
              <dd>${result.input.fixedCapitalCosts.toFixed(2)}</dd>

              <dt>Costos Fijos Trabajo:</dt>
              <dd>${result.input.fixedLaborCosts.toFixed(2)}</dd>

              <dt>Costos Variables:</dt>
              <dd>
                $
                {(
                  result.totalRevenue -
                  result.input.profit -
                  result.breakEven
                ).toFixed(2)}
              </dd>
            </dl>
          </div>

          {/* Punto de equilibrio */}
          <div className={styles.detailCard}>
            <h3>⚖️ Punto de Equilibrio</h3>
            <dl>
              <dt>Break-Even (USD):</dt>
              <dd>${result.breakEven.toFixed(2)}</dd>

              <dt>Ingresos Necesarios:</dt>
              <dd>${result.breakEven.toFixed(2)}</dd>

              <dt>Margen Actual:</dt>
              <dd>
                {(
                  ((result.totalRevenue - result.breakEven) /
                    result.totalRevenue) *
                  100
                ).toFixed(1)}
                %
              </dd>

              <dt>Estado:</dt>
              <dd>
                {result.totalRevenue >= result.breakEven
                  ? "✅ Por encima del equilibrio"
                  : "⚠️ Por debajo del equilibrio"}
              </dd>
            </dl>
          </div>

          {/* Excedente y distribución */}
          <div className={styles.detailCard}>
            <h3>🎯 Excedente</h3>
            <dl>
              <dt>Excedente Total (USD):</dt>
              <dd className={result.surplus > 0 ? styles.positive : styles.negative}>
                ${result.surplus.toFixed(2)}
              </dd>

              {result.surplus > 0 && (
                <>
                  <dt>Para Capital:</dt>
                  <dd>
                    ${result.distribution.capitalReturn.toFixed(2)} (
                    {(result.distribution.weightCapital * 100).toFixed(1)}%)
                  </dd>

                  <dt>Para Trabajo:</dt>
                  <dd>
                    ${result.distribution.laborSurplusPool.toFixed(2)} (
                    {(result.distribution.weightLabor * 100).toFixed(1)}%)
                  </dd>
                </>
              )}
            </dl>
          </div>

          {/* Información adicional */}
          <div className={styles.detailCard}>
            <h3>ℹ️ Información</h3>
            <dl>
              <dt>Empleados:</dt>
              <dd>{result.input.employeeCount}</dd>

              <dt>Moneda:</dt>
              <dd>{result.input.currency}</dd>

              <dt>Criterio Contable:</dt>
              <dd>{result.input.accountingCriteria}</dd>

              <dt>Período:</dt>
              <dd>{result.auditTrail.periodName}</dd>

              <dt>Calculado:</dt>
              <dd>
                {new Date(result.auditTrail.calculatedAt).toLocaleDateString(
                  "es-ES"
                )}
              </dd>
            </dl>
          </div>
        </div>
      </section>

      {/* Interpretación */}
      <section className={styles.interpretation}>
        <h2>🧠 Interpretación de Resultados</h2>
        <EconomicInterpretation result={result} />
      </section>
    </div>
  );
}

/**
 * Componente auxiliar: Interpretación de resultados
 */
function EconomicInterpretation({ result }: { result: CalculateResult }) {
  const { surplus, breakEven, totalRevenue, distribution } = result;
  const status = getEconomicStatus(surplus);

  let interpretation = "";

  if (status === "PERDIDA") {
    interpretation =
      "La empresa está generando pérdidas. Los ingresos no cubren los costos. Es necesario reducir costos o aumentar ingresos.";
  } else if (status === "EQUILIBRIO") {
    interpretation =
      "La empresa está en punto de equilibrio. Los ingresos cubren exactamente los costos. No hay excedente para reinvertir ni salarios.";
  } else {
    const marginPercentage = ((surplus / totalRevenue) * 100).toFixed(1);
    interpretation =
      `La empresa está generando un excedente de $${surplus.toFixed(2)} (${marginPercentage}% de margen). ` +
      `Este excedente se distribuye entre capital (${(distribution.weightCapital * 100).toFixed(1)}%) ` +
      `y trabajo (${(distribution.weightLabor * 100).toFixed(1)}%).`;
  }

  return (
    <div className={styles.interpretationBox}>
      <p>{interpretation}</p>
      <p>
        <strong>Punto de Equilibrio:</strong> La empresa necesita generar
        ingresos de ${breakEven.toFixed(2)} para cubrir todos los costos fijos.
        Actualmente está
        {totalRevenue >= breakEven ? " por encima" : " por debajo"} de este
        punto.
      </p>
    </div>
  );
}
