import apiClient from "@/services/apiClient";
import type { Costo, CostoInput } from "../types";

export const getCostos = async (): Promise<Costo[]> => {
  const response = await apiClient.get<Costo[]>("/api/costos");
  return response.data;
};

export const createCosto = async (payload: CostoInput): Promise<Costo> => {
  const response = await apiClient.post<Costo>("/api/costos", payload);
  return response.data;
};

export const updateCosto = async (id: string, payload: CostoInput): Promise<Costo> => {
  const response = await apiClient.put<Costo>(`/api/costos/${id}`, payload);
  return response.data;
};

export const deleteCosto = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/costos/${id}`);
};
