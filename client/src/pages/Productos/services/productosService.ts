import apiClient from "@/services/apiClient";
import type { Producto, ProductoInput } from "../types";

export const getProductos = async (): Promise<Producto[]> => {
  const response = await apiClient.get<Producto[]>("/api/productos");
  return response.data;
};

export const createProducto = async (payload: ProductoInput): Promise<Producto> => {
  const response = await apiClient.post<Producto>("/api/productos", payload);
  return response.data;
};

export const updateProducto = async (id: string, payload: ProductoInput): Promise<Producto> => {
  const response = await apiClient.put<Producto>(`/api/productos/${id}`, payload);
  return response.data;
};

export const deleteProducto = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/productos/${id}`);
};
