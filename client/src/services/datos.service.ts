// services/datos.service.ts
// Servicios para Ventas, Ganancias y Extras

import apiClient from "./apiClient";
import type {
  VentasData,
  GananciasData,
  ExtrasItem,
  DatosCargados,
} from "../types/planillas";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// VENTAS (totales, no unitarias)
// ========================================

export const ventasService = {
  async get(): Promise<VentasData | null> {
    const response = await apiClient.get<ApiResponse<VentasData>>("/api/ventas");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo ventas");
    }
    return response.data.data || null;
  },

  async save(data: Omit<VentasData, "id" | "fechaRegistro">): Promise<VentasData> {
    const response = await apiClient.post<ApiResponse<VentasData>>("/api/ventas", {
      ...data,
      fechaRegistro: new Date().toISOString(),
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error guardando ventas");
    }
    return response.data.data;
  },

  async update(id: string, data: Partial<VentasData>): Promise<VentasData> {
    const response = await apiClient.put<ApiResponse<VentasData>>(`/api/ventas/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando ventas");
    }
    return response.data.data;
  },
};

// ========================================
// GANANCIAS
// ========================================

export const gananciasService = {
  async get(): Promise<GananciasData | null> {
    const response = await apiClient.get<ApiResponse<GananciasData>>("/api/ganancias");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo ganancias");
    }
    return response.data.data || null;
  },

  async save(data: Omit<GananciasData, "id" | "fechaRegistro">): Promise<GananciasData> {
    const response = await apiClient.post<ApiResponse<GananciasData>>("/api/ganancias", {
      ...data,
      fechaRegistro: new Date().toISOString(),
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error guardando ganancias");
    }
    return response.data.data;
  },

  async update(id: string, data: Partial<GananciasData>): Promise<GananciasData> {
    const response = await apiClient.put<ApiResponse<GananciasData>>(`/api/ganancias/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando ganancias");
    }
    return response.data.data;
  },
};

// ========================================
// EXTRAS (costos fijos adicionales)
// ========================================

export const extrasService = {
  async getAll(): Promise<ExtrasItem[]> {
    const response = await apiClient.get<ApiResponse<ExtrasItem[]>>("/api/extras");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo extras");
    }
    return response.data.data || [];
  },

  async getById(id: string): Promise<ExtrasItem> {
    const response = await apiClient.get<ApiResponse<ExtrasItem>>(`/api/extras/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Extra no encontrado");
    }
    return response.data.data;
  },

  async create(data: Omit<ExtrasItem, "id">): Promise<ExtrasItem> {
    const response = await apiClient.post<ApiResponse<ExtrasItem>>("/api/extras", {
      ...data,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando extra");
    }
    return response.data.data;
  },

  async update(id: string, data: Partial<ExtrasItem>): Promise<ExtrasItem> {
    const response = await apiClient.put<ApiResponse<ExtrasItem>>(`/api/extras/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando extra");
    }
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/api/extras/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error eliminando extra");
    }
  },

  async getTotalCostosFijos(): Promise<number> {
    const extras = await this.getAll();
    return extras
      .filter((e) => e.esCostoFijo)
      .reduce((sum, e) => sum + e.montoMensualUSD * 12, 0);
  },
};

// ========================================
// DATOS CONSOLIDADOS PARA CÁLCULO
// ========================================

export async function getDatosCargados(): Promise<DatosCargados> {
  const response = await apiClient.get<ApiResponse<DatosCargados>>("/api/datos/consolidado");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error obteniendo datos consolidados");
  }
  return response.data.data;
}

export default {
  ventas: ventasService,
  ganancias: gananciasService,
  extras: extrasService,
  getDatosCargados,
};
