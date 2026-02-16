import type { EconomicStatus } from "../../services/apiTypes";
import styles from "../../styles/EconomicStatusCard.module.css";

export interface EconomicStatusCardProps {
  status: EconomicStatus;
  surplus: number;
  revenue: number;
  breakEven: number;
}

/**
 * 💳 Componente EconomicStatusCard
 * 
 * Tarjeta principal mostrando el estado económico de la empresa
 * Con indicador visual (color) y métricas clave
 */
export default function EconomicStatusCard({
  status,
  surplus,
  revenue,
  breakEven,
}: EconomicStatusCardProps) {
  const statusConfig = {
    PERDIDA: {
      label: "En Pérdida",
      icon: "📉",
      color: "#d32f2f",
      backgroundColor: "#ffebee",
    },
    EQUILIBRIO: {
      label: "En Equilibrio",
      icon: "⚖️",
      color: "#f57c00",
      backgroundColor: "#fff3e0",
    },
    EXCEDENTE: {
      label: "Con Excedente",
      icon: "📈",
      color: "#388e3c",
      backgroundColor: "#e8f5e9",
    },
  };

  const config = statusConfig[status];
  const margin = revenue > 0 ? ((surplus / revenue) * 100).toFixed(1) : 0;
  const coverage = breakEven > 0 ? ((revenue / breakEven) * 100).toFixed(1) : 0;

  return (
    <div
      className={styles.card}
      style={{ borderColor: config.color, backgroundColor: config.backgroundColor }}
    >
      <div className={styles.header}>
        <span className={styles.icon}>{config.icon}</span>
        <h2 className={styles.status} style={{ color: config.color }}>
          {config.label}
        </h2>
      </div>

      <div className={styles.mainMetric}>
        <div className={styles.surplus} style={{ color: config.color }}>
          ${surplus.toFixed(2)}
        </div>
        <div className={styles.surplusLabel}>Excedente Total</div>
      </div>

      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Ingresos</span>
          <span className={styles.metricValue}>${revenue.toFixed(2)}</span>
        </div>

        <div className={styles.metric}>
          <span className={styles.metricLabel}>Punto de Equilibrio</span>
          <span className={styles.metricValue}>${breakEven.toFixed(2)}</span>
        </div>

        <div className={styles.metric}>
          <span className={styles.metricLabel}>Margen (% de Ingresos)</span>
          <span className={styles.metricValue}>{margin}%</span>
        </div>

        <div className={styles.metric}>
          <span className={styles.metricLabel}>Cobertura de Costos</span>
          <span className={styles.metricValue}>{coverage}%</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: `${Math.min(parseFloat(coverage), 100)}%`,
            backgroundColor: config.color,
          }}
        />
      </div>
      <div className={styles.progressLabel}>
        {parseFloat(coverage) >= 100
          ? "✅ Cubre todos los costos"
          : `❌ ${(100 - parseFloat(coverage)).toFixed(1)}% faltante`}
      </div>
    </div>
  );
}
