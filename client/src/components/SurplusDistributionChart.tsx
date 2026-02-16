import type { CalculateDistribution } from "../../services/apiTypes";
import styles from "../../styles/SurplusDistributionChart.module.css";

export interface SurplusDistributionChartProps {
  distribution: CalculateDistribution;
}

/**
 * 💰 Componente SurplusDistributionChart
 * 
 * Visualiza cómo se distribuye el excedente entre capital y trabajo
 * Incluye gráfico pie + barras
 */
export default function SurplusDistributionChart({
  distribution,
}: SurplusDistributionChartProps) {
  const capitalPercent = distribution.weightCapital * 100;
  const laborPercent = distribution.weightLabor * 100;

  // Calcular ángulos para el gráfico pie
  const capitalAngle = (distribution.weightCapital * 360).toFixed(1);
  const laborAngle = (distribution.weightLabor * 360).toFixed(1);

  // SVG pie chart
  const capitalPercent_decimal = distribution.weightCapital;
  const laborPercent_decimal = distribution.weightLabor;

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <svg
          className={styles.pieChart}
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Gráfico pie usando SVG paths */}
          <PieChart
            capitalPercent={capitalPercent_decimal}
            laborPercent={laborPercent_decimal}
          />

          {/* Centro etiqueta */}
          <circle cx="100" cy="100" r="40" fill="white" stroke="none" />
          <text
            x="100"
            y="100"
            textAnchor="middle"
            dy="0.3em"
            fontSize="16"
            fontWeight="bold"
            fill="#333"
          >
            100%
          </text>
        </svg>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: "#2196f3" }}
            />
            <span className={styles.legendLabel}>Capital</span>
            <span className={styles.legendPercent}>{capitalPercent.toFixed(1)}%</span>
          </div>

          <div className={styles.legendItem}>
            <div
              className={styles.legendColor}
              style={{ backgroundColor: "#4caf50" }}
            />
            <span className={styles.legendLabel}>Trabajo</span>
            <span className={styles.legendPercent}>{laborPercent.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className={styles.details}>
        <h3>Distribución Detallada</h3>

        <div className={styles.detailItem}>
          <div className={styles.detailBar}>
            <div
              className={styles.detailBarFill}
              style={{
                width: `${capitalPercent}%`,
                backgroundColor: "#2196f3",
              }}
            />
          </div>
          <div className={styles.detailInfo}>
            <span className={styles.detailLabel}>Para Capital</span>
            <span className={styles.detailValue}>
              ${distribution.capitalReturn.toFixed(2)}
            </span>
            <span className={styles.detailPercent}>
              ({capitalPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className={styles.detailItem}>
          <div className={styles.detailBar}>
            <div
              className={styles.detailBarFill}
              style={{
                width: `${laborPercent}%`,
                backgroundColor: "#4caf50",
              }}
            />
          </div>
          <div className={styles.detailInfo}>
            <span className={styles.detailLabel}>Para Trabajo</span>
            <span className={styles.detailValue}>
              ${distribution.laborSurplusPool.toFixed(2)}
            </span>
            <span className={styles.detailPercent}>
              ({laborPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className={styles.interpretation}>
          <p>
            El excedente se reparte entre {capitalPercent.toFixed(1)}% para
            capital (reinversión, beneficios) y {laborPercent.toFixed(1)}% para
            trabajo (bonificaciones, incentivos).
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente auxiliar: Gráfico Pie SVG
 */
interface PieChartProps {
  capitalPercent: number;
  laborPercent: number;
}

function PieChart({ capitalPercent, laborPercent }: PieChartProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // Capital (azul)
  const capitalDashOffset = circumference * (1 - capitalPercent);

  // Calcular puntos para arcos
  const capitalAngle = capitalPercent * 360;

  return (
    <>
      {/* Círculo base */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="4"
      />

      {/* Arco capital (azul) */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#2196f3"
        strokeWidth="4"
        strokeDasharray={`${circumference * capitalPercent} ${circumference * laborPercent}`}
        strokeDashoffset={0}
        transform="rotate(-90 100 100)"
        strokeLinecap="round"
      />

      {/* Arco trabajo (verde) */}
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke="#4caf50"
        strokeWidth="4"
        strokeDasharray={`${circumference * laborPercent} ${circumference * capitalPercent}`}
        strokeDashoffset={-circumference * capitalPercent}
        transform="rotate(-90 100 100)"
        strokeLinecap="round"
      />
    </>
  );
}
