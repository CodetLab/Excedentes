import apiClient from "@/services/apiClient";
import type { Venta, VentaInput } from "../types";

export const getVentas = async (): Promise<Venta[]> => {
  const response = await apiClient.get<Venta[]>("/api/ventas");
  return response.data;
};

export const createVenta = async (payload: VentaInput): Promise<Venta> => {
  const response = await apiClient.post<Venta>("/api/ventas", payload);
  return response.data;
};

export const updateVenta = async (id: string, payload: VentaInput): Promise<Venta> => {
  const response = await apiClient.put<Venta>(`/api/ventas/${id}`, payload);
  return response.data;
};

export const deleteVenta = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/ventas/${id}`);
};
