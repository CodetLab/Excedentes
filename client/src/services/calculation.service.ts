// services/calculation.service.ts
// Servicio de cálculo económico - conecta con el motor del backend
// La UI solo carga datos y muestra resultados. No duplica lógica.

import apiClient from "./apiClient";
import type { CalculateInput, CalculateResult, ApiResponse } from "./apiTypes";
import type { DatosCargados } from "../types/planillas";

/**
 * Fórmula del sistema (calculada por el motor):
 * Costos Variables = Ventas - Ganancias - Costos Fijos
 * 
 * El frontend NO calcula esto - solo envía los datos al motor.
 */

const calculationService = {
  /**
   * NUEVO v0.0.4: Ejecutar cálculo usando datos persistidos por período
   * El backend consolida automáticamente los datos
   * 
   * El userId y companyId son extraídos del JWT por el middleware del backend
   */
  async calculateByPeriod(
    month: number,
    year: number
  ): Promise<CalculateResult> {
    const response = await apiClient.post<ApiResponse<CalculateResult>>(
      "/api/calculate",
      { month, year }
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error en el cálculo");
    }
    
    return response.data.data;
  },

  /**
   * Ejecutar cálculo económico con datos directos (simulación)
   * Usado para simulaciones rápidas
   */
  async calculate(input: CalculateInput): Promise<CalculateResult> {
    const response = await apiClient.post<ApiResponse<CalculateResult>>(
      "/api/calculate/direct",
      input
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error en el cálculo");
    }
    
    return response.data.data;
  },

  /**
   * Ejecutar cálculo usando los datos cargados en el sistema
   * Este es el método principal - usa todos los datos de las 11 planillas
   */
  async calculateFromLoadedData(): Promise<CalculateResult> {
    const response = await apiClient.post<ApiResponse<CalculateResult>>(
      "/api/calculate/from-data"
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error en el cálculo");
    }
    
    return response.data.data;
  },

  /**
   * Ejecutar cálculo para un período guardado
   */
  async calculateForPeriod(periodId: string): Promise<CalculateResult> {
    const response = await apiClient.post<ApiResponse<CalculateResult>>(
      `/api/calculate/period/${periodId}`
    );
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error en el cálculo");
    }
    
    return response.data.data;
  },

  /**
   * Obtener preview del cálculo sin guardarlo
   * Útil para mostrar resultados en tiempo real mientras se cargan datos
   */
  async preview(datos: DatosCargados): Promise<{
    costosFijos: number;
    costosVariables: number;
    puntoEquilibrio: number;
    excedente: number;
    gananciaCapital: number;
    gananciaPersonal: number;
  }> {
    const response = await apiClient.post<ApiResponse<{
      costosFijos: number;
      costosVariables: number;
      puntoEquilibrio: number;
      excedente: number;
      gananciaCapital: number;
      gananciaPersonal: number;
    }>>("/api/calculate/preview", datos);
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error en preview");
    }
    
    return response.data.data;
  },

  /**
   * Obtener estado actual del cálculo
   */
  async getStatus(): Promise<{
    datosCompletos: boolean;
    faltantes: string[];
    listoParaCalcular: boolean;
  }> {
    const response = await apiClient.get<ApiResponse<{
      datosCompletos: boolean;
      faltantes: string[];
      listoParaCalcular: boolean;
    }>>("/api/calculate/status");
    
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error obteniendo estado");
    }
    
    return response.data.data;
  },
};

export default calculationService;
