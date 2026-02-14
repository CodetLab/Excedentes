import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import calculationService from "../../services/calculation.service";
import dashboardService from "../../services/dashboard.service";
import type { PeriodSummary } from "../../services/dashboard.service";
import type { CalculateResult } from "../../services/apiTypes";
import { useAuth } from "../../context/AuthContext";
import { safeCurrency, safeDate } from "../../utils/formatters";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);
  const [result, setResult] = useState<CalculateResult | null>(null);
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar resumen del período
  const loadPeriodSummary = async () => {
    if (!user?.id) return;

    setLoadingSummary(true);
    setError(null);
    setPeriodSummary(null);
    setResult(null);

    try {
      const summary = await dashboardService.getPeriodSummary(user.id, month, year);
      setPeriodSummary(summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos del período");
      setPeriodSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Ejecutar cálculo económico
  const runCalculation = async () => {
    if (!user?.id || !periodSummary) return;

    setLoadingCalculation(true);
    setError(null);

    try {
      const calcResult = await calculationService.calculateByPeriod(user.id, month, year);
      setResult(calcResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error ejecutando cálculo");
      setResult(null);
    } finally {
      setLoadingCalculation(false);
    }
  };

  // Auto-cargar al cambiar período
  useEffect(() => {
    loadPeriodSummary();
  }, [month, year, user?.id]);

  const hasData = periodSummary && periodSummary.sales > 0;
  const economicStatus = result?.auditTrail?.status || "UNKNOWN";

  return (
    <div className="dashboard">
      <h1>Dashboard Económico</h1>
      <p className="dashboard-subtitle">
        Visualización consolidada de datos económicos y cálculo automático
      </p>

      <div className="dashboard-grid">
        {/* Selector de período */}
        <Card title="Seleccionar Período" className="period-card">
          <div className="period-selector">
            <div className="form-field">
              <label className="form-label">Mes</label>
              <select
                className="input"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString("es", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Año</label>
              <select
                className="input"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Tabla de datos consolidados */}
        <Card title="Datos del Período" className="data-card">
          {loadingSummary && <div className="loading">Cargando datos...</div>}
          
          {error && !periodSummary && (
            <div className="error-message">
              {error}
            </div>
          )}

          {periodSummary && (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th className="text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ventas</td>
                    <td className="text-right">{safeCurrency(periodSummary.sales)}</td>
                  </tr>
                  <tr>
                    <td>Ganancia</td>
                    <td className="text-right">{safeCurrency(periodSummary.profit)}</td>
                  </tr>
                  <tr>
                    <td>Personal</td>
                    <td className="text-right">{safeCurrency(periodSummary.totalPersonal)}</td>
                  </tr>
                  <tr>
                    <td>Capital</td>
                    <td className="text-right">{safeCurrency(periodSummary.totalCapital)}</td>
                  </tr>
                  <tr>
                    <td>Extras</td>
                    <td className="text-right">{safeCurrency(periodSummary.totalExtras)}</td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Costos Fijos</strong></td>
                    <td className="text-right"><strong>{safeCurrency(periodSummary.totalFixedCosts)}</strong></td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Costos</strong></td>
                    <td className="text-right"><strong>{safeCurrency(periodSummary.totalCosts)}</strong></td>
                  </tr>
                </tbody>
              </table>

              <div className="data-details">
                <small>
                  {periodSummary.details.ventasCount} ventas • {" "}
                  {periodSummary.details.capitalItemsCount} activos • {" "}
                  {periodSummary.details.empleadosCount} empleados • {" "}
                  {periodSummary.details.extrasCount} extras
                </small>
              </div>

              {hasData && (
                <div className="calculate-action">
                  <Button 
                    onClick={runCalculation} 
                    isLoading={loadingCalculation}
                    variant="primary"
                  >
                    Ejecutar Cálculo Económico
                  </Button>
                </div>
              )}

              {!hasData && (
                <div className="empty-state">
                  <p>⚠️ Datos incompletos para calcular</p>
                  <p className="text-muted">
                    Debe cargar al menos ventas para el período seleccionado.
                  </p>
                </div>
              )}
            </>
          )}

          {!loadingSummary && !periodSummary && !error && (
            <div className="empty-state">
              <p>No hay datos para el período seleccionado</p>
            </div>
          )}
        </Card>

        {/* Resultados del cálculo */}
        {result && (
          <div className="results-section">
            {/* Estado Económico */}
            <Card className={`status-card status-${economicStatus.toLowerCase()}`}>
              <div className="status-content">
                <span className="status-label">Estado Económico</span>
                <span className="status-value">
                  {economicStatus === "PASS" ? "✅ EXCEDENTE" : "⚠️ DÉFICIT"}
                </span>
              </div>
            </Card>

            {/* KPIs principales */}
            <div className="kpi-grid">
              <Card className="kpi-card">
                <div className="kpi-content">
                  <span className="kpi-label">Punto de Equilibrio</span>
                  <span className="kpi-value">
                    {safeCurrency(result.breakEven ?? 0)}
                  </span>
                </div>
              </Card>
              <Card className="kpi-card">
                <div className="kpi-content">
                  <span className="kpi-label">Ingresos Totales</span>
                  <span className="kpi-value">
                    {safeCurrency(result.totalRevenue ?? 0)}
                  </span>
                </div>
              </Card>
              <Card className="kpi-card">
                <div className="kpi-content">
                  <span className="kpi-label">Excedente</span>
                  <span className={`kpi-value ${(result.surplus ?? 0) >= 0 ? "positive" : "negative"}`}>
                    {safeCurrency(result.surplus ?? 0)}
                  </span>
                </div>
              </Card>
            </div>

            {/* Distribución */}
            {result.distribution && (
              <Card title="Distribución del Excedente">
                <div className="distribution-grid">
                  <div className="distribution-item">
                    <div className="distribution-info">
                      <span>Retorno Capital</span>
                      <span>{safeCurrency(result.distribution.capitalReturn ?? 0)}</span>
                      <span className="distribution-percent">
                        ({((result.distribution.weightCapital ?? 0) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill capital"
                        style={{
                          width: `${(result.distribution.weightCapital ?? 0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="distribution-item">
                    <div className="distribution-info">
                      <span>Pool Trabajo</span>
                      <span>{safeCurrency(result.distribution.laborSurplusPool ?? 0)}</span>
                      <span className="distribution-percent">
                        ({((result.distribution.weightLabor ?? 0) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill labor"
                        style={{
                          width: `${(result.distribution.weightLabor ?? 0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Audit Trail */}
            <Card title="Auditoría">
              <div className="audit-info">
                <div className="audit-row">
                  <span>Estado:</span>
                  <span className={`audit-status audit-${economicStatus.toLowerCase()}`}>
                    {economicStatus}
                  </span>
                </div>
                <div className="audit-row">
                  <span>Calculado:</span>
                  <span>{safeDate(result.auditTrail?.calculatedAt)}</span>
                </div>
                <div className="audit-row">
                  <span>Período:</span>
                  <span>{result.auditTrail?.periodName ?? "N/A"}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {error && result === null && periodSummary && (
          <Card className="error-card">
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
