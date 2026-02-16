import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import EconomicForm from "../components/EconomicForm";
import CalculationDashboard from "../components/CalculationDashboard";
import { useEconomicCalculation } from "../hooks/useEconomicCalculation";
import type { EconomicFormData } from "../hooks/useEconomicCalculation";
import styles from "../styles/EconomicCalculatorPage.module.css";

/**
 * 📊 Página EconomicCalculatorPage
 * 
 * Orquesta el flujo completo:
 * 1. Formulario de datos económicos
 * 2. Cálculo en backend
 * 3. Visualización de resultados
 * 
 * Estados:
 * - form: Usuario está cargando datos
 * - calculating: Enviando al backend
 * - result: Mostrando resultados
 * - error: Mostrar error y permitir reintentar
 */
export default function EconomicCalculatorPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { result, loading, error, calculate, clearError } =
    useEconomicCalculation();
  const [view, setView] = useState<"form" | "result">(
    result ? "result" : "form"
  );

  if (!isAuthenticated || !user) {
    return (
      <div className={styles.notAuthenticated}>
        <h2>❌ No autenticado</h2>
        <p>Por favor inicia sesión para acceder a la calculadora económica.</p>
      </div>
    );
  }

  const handleFormSubmit = async (formData: EconomicFormData) => {
    await calculate(formData);
    // La vista se cambia automáticamente si el cálculo es exitoso
  };

  // Cambiar vista cuando hay resultado
  if (result && view === "form") {
    setView("result");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>📊 Calculadora Económica</h1>
          <span className={styles.userInfo}>
            {user.name || user.email}
            {user.companyId && <span className={styles.companyId}>({user.companyId.slice(0, 8)}...)</span>}
          </span>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          Cerrar Sesión
        </button>
      </header>

      <div className={styles.container}>
        {view === "form" ? (
          <div className={styles.section}>
            <EconomicForm
              onSubmit={handleFormSubmit}
              loading={loading}
              error={error}
              onErrorDismiss={clearError}
            />
          </div>
        ) : (
          result && (
            <div className={styles.section}>
              <CalculationDashboard
                result={result}
                onBack={() => {
                  setView("form");
                  clearError();
                }}
              />
            </div>
          )
        )}
      </div>

      {/* Floating action bar */}
      <div className={styles.actionBar}>
        <div className={styles.actionContent}>
          {view === "result" && (
            <>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  setView("form");
                  clearError();
                }}
              >
                ← Volver al Formulario
              </button>
              <button
                className={styles.actionBtn}
                onClick={() => {
                  window.print();
                }}
              >
                🖨️ Imprimir Resultados
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
