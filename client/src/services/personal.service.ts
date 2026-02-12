// services/personal.service.ts
// Servicios para las 2 planillas de Personal

import apiClient from "./apiClient";
import type {
  PersonalPropioItem,
  PersonalTercerosItem,
  PersonalSummary,
} from "../types/planillas";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// PERSONAL PROPIO
// ========================================

export const personalPropioService = {
  async getAll(): Promise<PersonalPropioItem[]> {
    const response = await apiClient.get<ApiResponse<PersonalPropioItem[]>>("/api/personal/propio");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo personal propio");
    }
    return response.data.data || [];
  },

  async getById(id: string): Promise<PersonalPropioItem> {
    const response = await apiClient.get<ApiResponse<PersonalPropioItem>>(`/api/personal/propio/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Personal no encontrado");
    }
    return response.data.data;
  },

  async create(data: Omit<PersonalPropioItem, "id">): Promise<PersonalPropioItem> {
    // Calcular costo total mensual
    const costoTotalMensualUSD = data.salarioMensualUSD + data.cargosSocialesUSD;
    const response = await apiClient.post<ApiResponse<PersonalPropioItem>>("/api/personal/propio", {
      ...data,
      costoTotalMensualUSD,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando personal");
    }
    return response.data.data;
  },

  async update(id: string, data: Partial<PersonalPropioItem>): Promise<PersonalPropioItem> {
    // Recalcular costo total si cambian los componentes
    const updateData = { ...data };
    if (data.salarioMensualUSD !== undefined || data.cargosSocialesUSD !== undefined) {
      const current = await this.getById(id);
      const salario = data.salarioMensualUSD ?? current.salarioMensualUSD;
      const cargos = data.cargosSocialesUSD ?? current.cargosSocialesUSD;
      updateData.costoTotalMensualUSD = salario + cargos;
    }
    const response = await apiClient.put<ApiResponse<PersonalPropioItem>>(`/api/personal/propio/${id}`, updateData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando personal");
    }
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/personal/propio/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error eliminando personal");
    }
  },

  async getActivos(): Promise<PersonalPropioItem[]> {
    const all = await this.getAll();
    return all.filter((p) => p.activo);
  },
};

// ========================================
// PERSONAL DE TERCEROS
// ========================================

export const personalTercerosService = {
  async getAll(): Promise<PersonalTercerosItem[]> {
    const response = await apiClient.get<ApiResponse<PersonalTercerosItem[]>>("/api/personal/terceros");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo personal terceros");
    }
    return response.data.data || [];
  },

  async getById(id: string): Promise<PersonalTercerosItem> {
    const response = await apiClient.get<ApiResponse<PersonalTercerosItem>>(`/api/personal/terceros/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Servicio no encontrado");
    }
    return response.data.data;
  },

  async create(data: Omit<PersonalTercerosItem, "id">): Promise<PersonalTercerosItem> {
    const response = await apiClient.post<ApiResponse<PersonalTercerosItem>>("/api/personal/terceros", data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando servicio terceros");
    }
    return response.data.data;
  },

  async update(id: string, data: Partial<PersonalTercerosItem>): Promise<PersonalTercerosItem> {
    const response = await apiClient.put<ApiResponse<PersonalTercerosItem>>(`/api/personal/terceros/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando servicio");
    }
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/personal/terceros/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error eliminando servicio");
    }
  },

  async getActivos(): Promise<PersonalTercerosItem[]> {
    const all = await this.getAll();
    const now = new Date();
    return all.filter((p) => !p.fechaFin || new Date(p.fechaFin) >= now);
  },
};

// ========================================
// RESUMEN CONSOLIDADO
// ========================================

export async function getPersonalSummary(): Promise<PersonalSummary> {
  const response = await apiClient.get<ApiResponse<PersonalSummary>>("/api/personal/summary");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error obteniendo resumen de personal");
  }
  return response.data.data;
}

export default {
  propio: personalPropioService,
  terceros: personalTercerosService,
  getSummary: getPersonalSummary,
};
