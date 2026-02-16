import { useState, useEffect } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import calculationService from "../../services/calculation.service";
import dashboardService from "../../services/dashboard.service";
import type { PeriodSummary } from "../../services/dashboard.service";
import type { CalculateResult } from "../../services/apiTypes";
import { useAuth } from "../../context/AuthContext";
import { safeCurrency } from "../../utils/formatters";
import { validateEconomicPreconditions } from "../../utils/validators";
import type { ValidationResult } from "../../utils/validators";
import CalculationResults from "./components/CalculationResults";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);
  const [economicSnapshot, setEconomicSnapshot] = useState<CalculateResult | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar resumen del período
  const loadPeriodSummary = async () => {
    setLoadingSummary(true);
    setError(null);
    setPeriodSummary(null);
    setEconomicSnapshot(null); // 🔒 Resetear snapshot cuando cambia período
    setValidation(null);

    try {
      const summary = await dashboardService.getPeriodSummary(month, year);
      setPeriodSummary(summary);
      
      // Validar precondiciones automáticamente
      const validationResult = validateEconomicPreconditions(summary);
      setValidation(validationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando datos del período");
      setPeriodSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  // Ejecutar cálculo económico (solo si pasa validación)
  const runCalculation = async () => {
    if (!periodSummary || !validation?.valid) return;

    setLoadingCalculation(true);
    setError(null);

    try {
      const calcResult = await calculationService.calculateByPeriod(month, year);
      setEconomicSnapshot(calcResult); // 🔒 Guardar snapshot congelado
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error ejecutando cálculo");
      setEconomicSnapshot(null);
    } finally {
      setLoadingCalculation(false);
    }
  };

  // Auto-cargar al cambiar período
  useEffect(() => {
    loadPeriodSummary();
  }, [month, year]);

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

              {/* Mensajes de validación */}
              {validation && !validation.valid && (
                <div className="validation-issues">
                  <div className="validation-header">
                    <span className="validation-icon">⚠️</span>
                    <span className="validation-title">Datos incompletos</span>
                  </div>
                  <ul className="validation-list">
                    {validation.blockingIssues.map((issue, idx) => (
                      <li key={idx} className="blocking-issue">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation && validation.valid && validation.warnings.length > 0 && (
                <div className="validation-warnings">
                  <div className="validation-header">
                    <span className="validation-icon">ℹ️</span>
                    <span className="validation-title">Advertencias</span>
                  </div>
                  <ul className="validation-list">
                    {validation.warnings.map((warning, idx) => (
                      <li key={idx} className="warning-issue">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón de cálculo (habilitado solo si validación pasó) */}
              {validation && (
                <div className="calculate-action">
                  <Button 
                    onClick={runCalculation} 
                    isLoading={loadingCalculation}
                    variant="primary"
                    disabled={!validation.valid}
                  >
                    {validation.valid ? "Ejecutar Cálculo Económico" : "Complete los datos para calcular"}
                  </Button>
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

        {/* Resultados del cálculo económico (snapshot congelado) */}
        <CalculationResults 
          snapshot={economicSnapshot}
          isLoading={loadingCalculation}
          hasError={!!error && !periodSummary}
          errorMessage={error || undefined}
        />

        {error && economicSnapshot === null && periodSummary && (
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
