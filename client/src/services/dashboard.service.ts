// services/dashboard.service.ts
// Servicio para obtener datos consolidados del dashboard

import apiClient from "./apiClient";
import type { ApiResponse } from "./apiTypes";

export interface PeriodSummary {
  period: {
    month: number;
    year: number;
    name: string;
  };
  sales: number;
  profit: number;
  totalPersonal: number;
  totalCapital: number;
  totalExtras: number;
  totalFixedCosts: number;
  totalCosts: number;
  details: {
    ventasCount: number;
    capitalItemsCount: number;
    empleadosCount: number;
    extrasCount: number;
  };
  breakdown: {
    fixedCapitalCosts: number;
    variableCapitalCosts: number;
    fixedLaborCosts: number;
    variableLaborCosts: number;
  };
}

/**
 * Obtener resumen consolidado de un período sin ejecutar cálculo
 * Usado por el dashboard para mostrar tabla de datos
 */
export async function getPeriodSummary(
  userId: string,
  month: number,
  year: number
): Promise<PeriodSummary> {
  const response = await apiClient.get<ApiResponse<PeriodSummary>>(
    `/api/dashboard/period-summary?userId=${userId}&month=${month}&year=${year}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error obteniendo resumen del período");
  }

  return response.data.data;
}

const dashboardService = {
  getPeriodSummary,
};

export default dashboardService;
