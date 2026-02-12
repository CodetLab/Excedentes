import { useState } from "react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import calculationService from "../../services/calculation.service";
import type { CalculateInput, CalculateResult } from "../../services/apiTypes";
import { getEconomicStatus } from "../../services/apiTypes";
import { safeCurrency, safeDate, safePercentDirect } from "../../utils/formatters";
import "./Dashboard.css";

const initialFormData: CalculateInput = {
  sales: 0,
  fixedCapitalCosts: 0,
  fixedLaborCosts: 0,
  profit: 0,
  amortization: 0,
  interests: 0,
  period: "2026-Q1",
  currency: "USD",
  inflationIndex: 1,
  accountingCriteria: "ACCRUAL",
};

const Dashboard = () => {
  const [formData, setFormData] = useState<CalculateInput>(initialFormData);
  const [result, setResult] = useState<CalculateResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const calcResult = await calculationService.calculate(formData);
      setResult(calcResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  const economicStatus = result ? getEconomicStatus(result.surplus) : null;

  return (
    <div className="dashboard">
      <h1>Cálculo Económico</h1>
      <p className="dashboard-subtitle">
        Ingrese los datos del período para calcular el excedente distribuible
      </p>

      <div className="dashboard-grid">
        {/* Formulario de entrada */}
        <Card title="Datos Económicos" className="form-card">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <Input
                label="Ventas Totales (USD)"
                name="sales"
                type="number"
                min={0}
                step={0.01}
                value={formData.sales}
                onChange={handleChange}
                required
              />
              <Input
                label="Ganancia (USD)"
                name="profit"
                type="number"
                min={0}
                step={0.01}
                value={formData.profit}
                onChange={handleChange}
              />
              <Input
                label="Costos Fijos Capital (USD)"
                name="fixedCapitalCosts"
                type="number"
                min={0}
                step={0.01}
                value={formData.fixedCapitalCosts}
                onChange={handleChange}
              />
              <Input
                label="Costos Fijos Trabajo (USD)"
                name="fixedLaborCosts"
                type="number"
                min={0}
                step={0.01}
                value={formData.fixedLaborCosts}
                onChange={handleChange}
              />
              <Input
                label="Amortización (USD)"
                name="amortization"
                type="number"
                min={0}
                step={0.01}
                value={formData.amortization}
                onChange={handleChange}
              />
              <Input
                label="Intereses (USD)"
                name="interests"
                type="number"
                min={0}
                step={0.01}
                value={formData.interests}
                onChange={handleChange}
              />
              <Input
                label="Período"
                name="period"
                type="text"
                value={formData.period}
                onChange={handleChange}
              />
              <div className="form-field">
                <label className="form-label">Moneda</label>
                <select
                  name="currency"
                  className="input"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="USD">USD</option>
                  <option value="ARS">ARS</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <Button type="submit" isLoading={loading}>
                Calcular
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                Limpiar
              </Button>
            </div>
          </form>
        </Card>

        {/* Resultados */}
        <div className="results-section">
          {error && (
            <Card className="error-card">
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            </Card>
          )}

          {result && (
            <>
              {/* Estado Económico */}
              <Card className={`status-card status-${economicStatus?.toLowerCase()}`}>
                <div className="status-content">
                  <span className="status-label">Estado Económico</span>
                  <span className="status-value">{economicStatus}</span>
                </div>
              </Card>

              {/* KPIs principales */}
              <div className="kpi-grid">
                <Card className="kpi-card">
                  <div className="kpi-content">
                    <span className="kpi-label">Punto de Equilibrio</span>
                    <span className="kpi-value">
                      {safeCurrency(result.breakEven)}
                    </span>
                  </div>
                </Card>
                <Card className="kpi-card">
                  <div className="kpi-content">
                    <span className="kpi-label">Ingresos Totales</span>
                    <span className="kpi-value">
                      {safeCurrency(result.totalRevenue)}
                    </span>
                  </div>
                </Card>
                <Card className="kpi-card">
                  <div className="kpi-content">
                    <span className="kpi-label">Excedente</span>
                    <span className={`kpi-value ${result.surplus >= 0 ? "positive" : "negative"}`}>
                      {safeCurrency(result.surplus)}
                    </span>
                  </div>
                </Card>
              </div>

              {/* Distribución */}
              <Card title="Distribución del Excedente">
                <div className="distribution-grid">
                  <div className="distribution-item">
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill capital"
                        style={{
                          width: `${result.distribution.weightCapital * 100}%`,
                        }}
                      />
                    </div>
                    <div className="distribution-info">
                      <span>Retorno Capital</span>
                      <span>{safeCurrency(result.distribution.capitalReturn)}</span>
                      <span className="distribution-percent">
                        ({safePercentDirect(result.distribution.weightCapital * 100)})
                      </span>
                    </div>
                  </div>
                  <div className="distribution-item">
                    <div className="distribution-bar">
                      <div
                        className="distribution-fill labor"
                        style={{
                          width: `${result.distribution.weightLabor * 100}%`,
                        }}
                      />
                    </div>
                    <div className="distribution-info">
                      <span>Pool Trabajo</span>
                      <span>{safeCurrency(result.distribution.laborSurplusPool)}</span>
                      <span className="distribution-percent">
                        ({safePercentDirect(result.distribution.weightLabor * 100)})
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Audit Trail */}
              <Card title="Auditoría">
                <div className="audit-info">
                  <div className="audit-row">
                    <span>Estado:</span>
                    <span className={`audit-status audit-${result.auditTrail.status.toLowerCase()}`}>
                      {result.auditTrail.status}
                    </span>
                  </div>
                  <div className="audit-row">
                    <span>Calculado:</span>
                    <span>{safeDate(result.auditTrail.calculatedAt)}</span>
                  </div>
                  <div className="audit-row">
                    <span>Período:</span>
                    <span>{result.auditTrail.periodName}</span>
                  </div>
                </div>
              </Card>
            </>
          )}

          {!result && !error && !loading && (
            <Card className="empty-state">
              <div className="empty-content">
                <p>Ingrese los datos económicos y presione "Calcular" para ver los resultados</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
