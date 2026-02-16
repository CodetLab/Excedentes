import styles from "../../styles/BreakEvenChart.module.css";

export interface BreakEvenChartProps {
  breakEven: number;
  revenue: number;
}

/**
 * 📊 Componente BreakEvenChart
 * 
 * Visualiza el punto de equilibrio vs ingresos actuales
 * Gráfico de barras simple usando SVG
 */
export default function BreakEvenChart({
  breakEven,
  revenue,
}: BreakEvenChartProps) {
  const maxValue = Math.max(breakEven, revenue);
  const breakEvenPercent = (breakEven / maxValue) * 100;
  const revenuePercent = (revenue / maxValue) * 100;

  const isAboveBreakEven = revenue >= breakEven;
  const difference = Math.abs(revenue - breakEven);
  const diffPercent = ((difference / maxValue) * 100).toFixed(1);

  return (
    <div className={styles.chartContainer}>
      <svg
        className={styles.svg}
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid background */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#eee"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        <rect width="400" height="300" fill="url(#grid)" />

        {/* Y-axis */}
        <line x1="50" y1="30" x2="50" y2="250" stroke="#333" strokeWidth="2" />

        {/* X-axis */}
        <line x1="50" y1="250" x2="380" y2="250" stroke="#333" strokeWidth="2" />

        {/* Y-axis labels */}
        <text x="40" y="255" textAnchor="end" fontSize="12" fill="#666">
          0
        </text>
        <text x="40" y="140" textAnchor="end" fontSize="12" fill="#666">
          50%
        </text>
        <text x="40" y="30" textAnchor="end" fontSize="12" fill="#666">
          100%
        </text>

        {/* Bar 1: Break-Even */}
        <g>
          <rect
            x="80"
            y={250 - (breakEvenPercent / 100) * 220}
            width="60"
            height={(breakEvenPercent / 100) * 220}
            fill="#ff9800"
            stroke="#f57c00"
            strokeWidth="1"
          />
          <text x="110" y="270" textAnchor="middle" fontSize="12" fill="#333">
            Break-Even
          </text>
          <text
            x="110"
            y={250 - (breakEvenPercent / 100) * 220 - 10}
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fill="#f57c00"
          >
            ${(breakEven / 1000).toFixed(1)}K
          </text>
        </g>

        {/* Bar 2: Revenue */}
        <g>
          <rect
            x="180"
            y={250 - (revenuePercent / 100) * 220}
            width="60"
            height={(revenuePercent / 100) * 220}
            fill={isAboveBreakEven ? "#4caf50" : "#f44336"}
            stroke={isAboveBreakEven ? "#388e3c" : "#d32f2f"}
            strokeWidth="1"
          />
          <text x="210" y="270" textAnchor="middle" fontSize="12" fill="#333">
            Ingresos
          </text>
          <text
            x="210"
            y={250 - (revenuePercent / 100) * 220 - 10}
            textAnchor="middle"
            fontSize="13"
            fontWeight="bold"
            fill={isAboveBreakEven ? "#4caf50" : "#f44336"}
          >
            ${(revenue / 1000).toFixed(1)}K
          </text>
        </g>

        {/* Difference indicator line */}
        {isAboveBreakEven && (
          <g>
            <line
              x1="140"
              y1={250 - (breakEvenPercent / 100) * 220}
              x2="180"
              y2={250 - (revenuePercent / 100) * 220}
              stroke="#4caf50"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            <text
              x={(140 + 180) / 2}
              y={
                (250 - (breakEvenPercent / 100) * 220 +
                  250 - (revenuePercent / 100) * 220) /
                2 - 15
              }
              textAnchor="middle"
              fontSize="11"
              fill="#4caf50"
              fontWeight="bold"
            >
              +${(difference / 1000).toFixed(1)}K
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(50, 20)">
          <rect width="300" height="40" fill="#f9f9f9" stroke="#ccc" rx="4" />
          <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#333">
            Análisis de Punto de Equilibrio
          </text>
          <text x="10" y="35" fontSize="11" fill="#666">
            Compara los ingresos actuales con el mínimo necesario para cubrir costos fijos
          </text>
        </g>
      </svg>

      <div className={styles.interpretation}>
        {isAboveBreakEven ? (
          <div className={styles.success}>
            ✅ <strong>Por encima del equilibrio</strong>
            <p>
              Tienes ${(difference / 1000).toFixed(2)}K ({diffPercent}%) más de
              lo que necesitas para cubrir costos fijos
            </p>
          </div>
        ) : (
          <div className={styles.warning}>
            ⚠️ <strong>Por debajo del equilibrio</strong>
            <p>
              Necesitas ${(difference / 1000).toFixed(2)}K ({diffPercent}%) más
              en ingresos para cubrir los costos fijos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
