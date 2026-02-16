import { useState, useCallback } from "react";
import type { CalculateInput, CalculateResult } from "../services/apiTypes";
import calculationService from "../services/calculation.service";
import { useAuth } from "../context/AuthContext";

export interface EconomicFormData {
  sales: number;
  fixedCapitalCosts: number;
  fixedLaborCosts: number;
  profit: number;
  amortization?: number;
  interests?: number;
  employeeCount?: number;
}

export interface CalculationState {
  result: CalculateResult | null;
  loading: boolean;
  error: string | null;
}

/**
 * 🎯 Hook useEconomicCalculation
 * Maneja la lógica de cálculo económico y estados
 * 
 * Responsabilidades:
 * - Mapear datos del formulario a input del API
 * - Ejecutar llamada a POST /api/calculate
 * - Manejar estados: loading, error, success
 * - Limpiar errores automáticamente
 */
export function useEconomicCalculation() {
  const { token, companyId } = useAuth();
  const [state, setState] = useState<CalculationState>({
    result: null,
    loading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Ejecutar cálculo usando datos del formulario
   * 
   * El token se incluye automáticamente en headers por el interceptor de axios
   * El backend extrae companyId del JWT, no del body
   */
  const calculate = useCallback(
    async (formData: EconomicFormData) => {
      if (!token) {
        setState({
          result: null,
          loading: false,
          error: "No autenticado. Por favor inicia sesión.",
        });
        return;
      }

      if (!companyId) {
        setState({
          result: null,
          loading: false,
          error:
            "Usuario no asignado a empresa. Contacta al administrador.",
        });
        return;
      }

      setState({ result: null, loading: true, error: null });

      try {
        // Mapear datos del formulario a input del servicio
        const input: CalculateInput = {
          sales: formData.sales,
          fixedCapitalCosts: formData.fixedCapitalCosts,
          fixedLaborCosts: formData.fixedLaborCosts,
          profit: formData.profit,
          amortization: formData.amortization ?? 0,
          interests: formData.interests ?? 0,
          currency: "USD",
          inflationIndex: 1,
          accountingCriteria: "ACCRUAL",
          // No incluir userId ni companyId - vienen del JWT
        };

        // Llamar al servicio
        const result = await calculationService.calculate(input);

        setState({
          result,
          loading: false,
          error: null,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error en el cálculo";
        setState({
          result: null,
          loading: false,
          error: message,
        });
      }
    },
    [token, companyId]
  );

  return {
    ...state,
    calculate,
    clearError,
  };
}
