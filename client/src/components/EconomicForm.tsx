import { useState } from "react";
import type { EconomicFormData } from "../../hooks/useEconomicCalculation";
import styles from "../../styles/EconomicForm.module.css";

export interface EconomicFormProps {
  onSubmit: (data: EconomicFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorDismiss?: () => void;
}

/**
 * 📋 Componente EconomicForm
 * 
 * Formulario para capturar datos económicos de una empresa
 * Incluye validación básica y feedback visual
 * 
 * Campos:
 * - Ventas totales (USD)
 * - Costos fijos de capital
 * - Costos fijos de trabajo
 * - Ganancias
 * - Amortización (opcional)
 * - Intereses (opcional)
 */
export default function EconomicForm({
  onSubmit,
  loading = false,
  error = null,
  onErrorDismiss,
}: EconomicFormProps) {
  const [formData, setFormData] = useState<EconomicFormData>({
    sales: 0,
    fixedCapitalCosts: 0,
    fixedLaborCosts: 0,
    profit: 0,
    amortization: 0,
    interests: 0,
  });

  const [validationErrors, setValidationErrors] = useState<
    Partial<Record<keyof EconomicFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const errors: typeof validationErrors = {};

    if (formData.sales < 0) {
      errors.sales = "Las ventas no pueden ser negativas";
    }

    if (formData.fixedCapitalCosts < 0) {
      errors.fixedCapitalCosts = "Los costos no pueden ser negativos";
    }

    if (formData.fixedLaborCosts < 0) {
      errors.fixedLaborCosts = "Los costos no pueden ser negativos";
    }

    if (formData.profit < 0) {
      errors.profit = "La ganancia no puede ser negativa";
    }

    // Validación económica: Ventas >= Ganancias + Costos Fijos
    const totalFixedCosts = formData.fixedCapitalCosts + formData.fixedLaborCosts;
    if (formData.sales < formData.profit + totalFixedCosts) {
      errors.sales =
        "Ventas insuficientes: deben ser ≥ Ganancias + Costos Fijos";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof EconomicFormData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando empieza a escribir
    setValidationErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      // El error se maneja en el hook
      console.error("Error en submit:", err);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>📊 Datosonomic</h2>

      {error && (
        <div className={styles.errorBanner}>
          <p>{error}</p>
          <button
            type="button"
            className={styles.dismissButton}
            onClick={onErrorDismiss}
          >
            ✕
          </button>
        </div>
      )}

      <fieldset className={styles.fieldset} disabled={loading}>
        <legend className={styles.legend}>Ingresos</legend>

        <div className={styles.field}>
          <label htmlFor="sales">Ingresos Totales (USD)</label>
          <input
            id="sales"
            type="number"
            min="0"
            step="0.01"
            value={formData.sales}
            onChange={(e) => handleChange("sales", parseFloat(e.target.value) || 0)}
            className={validationErrors.sales ? styles.inputError : ""}
          />
          {validationErrors.sales && (
            <span className={styles.errorText}>{validationErrors.sales}</span>
          )}
          <small>Ingresos totales generados en el período</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="profit">Ganancia Neta (USD)</label>
          <input
            id="profit"
            type="number"
            min="0"
            step="0.01"
            value={formData.profit}
            onChange={(e) => handleChange("profit", parseFloat(e.target.value) || 0)}
            className={validationErrors.profit ? styles.inputError : ""}
          />
          {validationErrors.profit && (
            <span className={styles.errorText}>{validationErrors.profit}</span>
          )}
          <small>Ganancia neta después de costos variables</small>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={loading}>
        <legend className={styles.legend}>Costos Fijos</legend>

        <div className={styles.field}>
          <label htmlFor="fixedCapitalCosts">Costos Fijos de Capital (USD)</label>
          <input
            id="fixedCapitalCosts"
            type="number"
            min="0"
            step="0.01"
            value={formData.fixedCapitalCosts}
            onChange={(e) =>
              handleChange("fixedCapitalCosts", parseFloat(e.target.value) || 0)
            }
            className={
              validationErrors.fixedCapitalCosts ? styles.inputError : ""
            }
          />
          {validationErrors.fixedCapitalCosts && (
            <span className={styles.errorText}>
              {validationErrors.fixedCapitalCosts}
            </span>
          )}
          <small>Amortización de activos, mantenimiento, seguros</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="fixedLaborCosts">Costos Fijos de Trabajo (USD)</label>
          <input
            id="fixedLaborCosts"
            type="number"
            min="0"
            step="0.01"
            value={formData.fixedLaborCosts}
            onChange={(e) =>
              handleChange("fixedLaborCosts", parseFloat(e.target.value) || 0)
            }
            className={
              validationErrors.fixedLaborCosts ? styles.inputError : ""
            }
          />
          {validationErrors.fixedLaborCosts && (
            <span className={styles.errorText}>
              {validationErrors.fixedLaborCosts}
            </span>
          )}
          <small>Salarios fijos de empleados</small>
        </div>
      </fieldset>

      <fieldset className={styles.fieldset} disabled={loading}>
        <legend className={styles.legend}>Otros Costos (Opcional)</legend>

        <div className={styles.field}>
          <label htmlFor="amortization">Amortización (USD)</label>
          <input
            id="amortization"
            type="number"
            min="0"
            step="0.01"
            value={formData.amortization || 0}
            onChange={(e) =>
              handleChange("amortization", parseFloat(e.target.value) || 0)
            }
          />
          <small>Depreciación de activos fijos</small>
        </div>

        <div className={styles.field}>
          <label htmlFor="interests">Intereses (USD)</label>
          <input
            id="interests"
            type="number"
            min="0"
            step="0.01"
            value={formData.interests || 0}
            onChange={(e) =>
              handleChange("interests", parseFloat(e.target.value) || 0)
            }
          />
          <small>Intereses de deudas y préstamos</small>
        </div>
      </fieldset>

      <div className={styles.summary}>
        <h3>Resumen de Costos Fijos</h3>
        <div className={styles.summaryRow}>
          <span>Costos de Capital:</span>
          <strong>${formData.fixedCapitalCosts.toFixed(2)}</strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Costos de Trabajo:</span>
          <strong>${formData.fixedLaborCosts.toFixed(2)}</strong>
        </div>
        <div className={styles.summaryRow} style={{ borderTop: "1px solid #ccc", paddingTop: "8px", marginTop: "8px" }}>
          <span>Total Costos Fijos:</span>
          <strong>
            ${(formData.fixedCapitalCosts + formData.fixedLaborCosts).toFixed(2)}
          </strong>
        </div>
        <div className={styles.summaryRow}>
          <span>Punto de Equilibrio:</span>
          <strong>
            ${(formData.fixedCapitalCosts + formData.fixedLaborCosts).toFixed(2)}
          </strong>
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? "Calculando..." : "Calcular Excedente"}
      </button>
    </form>
  );
}
