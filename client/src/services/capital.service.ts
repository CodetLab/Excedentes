// services/capital.service.ts
// Servicios para las 6 planillas de Capital

import apiClient from "./apiClient";
import type {
  TierraItem,
  InmuebleItem,
  MuebleItem,
  VehiculoItem,
  HerramientaItem,
  StockItem,
  CapitalType,
  CapitalSummary,
} from "../types/planillas";


const ENDPOINTS: Record<CapitalType, string> = {
  tierras: "/api/capital/tierras",
  inmuebles: "/api/capital/inmuebles",
  muebles: "/api/capital/muebles",
  vehiculos: "/api/capital/vehiculos",
  herramientas: "/api/capital/herramientas",
  stock: "/api/capital/stock",
};

type CapitalItem = TierraItem | InmuebleItem | MuebleItem | VehiculoItem | HerramientaItem | StockItem;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ========================================
// CRUD GENÉRICO
// ========================================

// Helper: Map MongoDB _id to id
function mapMongoId<T extends CapitalItem>(item: any): T {
  if (!item) return item;
  const { _id, ...rest } = item;
  return { ...rest, id: _id } as T;
}

async function getAll<T extends CapitalItem>(type: CapitalType): Promise<T[]> {
  const response = await apiClient.get<ApiResponse<any[]>>(ENDPOINTS[type]);
  if (!response.data.success) {
    throw new Error(response.data.error || `Error obteniendo ${type}`);
  }
  const items = response.data.data || [];
  return items.map(item => mapMongoId<T>(item));
}

async function getById<T extends CapitalItem>(type: CapitalType, id: string): Promise<T> {
  const response = await apiClient.get<ApiResponse<any>>(`${ENDPOINTS[type]}/${id}`);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || `${type} no encontrado`);
  }
  return mapMongoId<T>(response.data.data);
}

async function create<T extends CapitalItem>(type: CapitalType, data: Omit<T, "id">): Promise<T> {
  const response = await apiClient.post<ApiResponse<any>>(ENDPOINTS[type], data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || `Error creando ${type}`);
  }
  return mapMongoId<T>(response.data.data);
}

async function update<T extends CapitalItem>(type: CapitalType, id: string, data: Partial<T>): Promise<T> {
  const response = await apiClient.put<ApiResponse<any>>(`/api/capital/item/${id}`, data);
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || `Error actualizando ${type}`);
  }
  return mapMongoId<T>(response.data.data);
}

async function remove(type: CapitalType, id: string): Promise<void> {
  const response = await apiClient.delete<ApiResponse<void>>(`/api/capital/item/${id}`);
  if (!response.data.success) {
    throw new Error(response.data.error || `Error eliminando ${type}`);
  }
}

// ========================================
// SERVICIOS ESPECÍFICOS POR TIPO
// ========================================

export const tierrasService = {
  getAll: () => getAll<TierraItem>("tierras"),
  getById: (id: string) => getById<TierraItem>("tierras", id),
  create: (data: Omit<TierraItem, "id">) => create<TierraItem>("tierras", data),
  update: (id: string, data: Partial<TierraItem>) => update<TierraItem>("tierras", id, data),
  remove: (id: string) => remove("tierras", id),
};

export const inmueblesService = {
  getAll: () => getAll<InmuebleItem>("inmuebles"),
  getById: (id: string) => getById<InmuebleItem>("inmuebles", id),
  create: (data: Omit<InmuebleItem, "id">) => create<InmuebleItem>("inmuebles", data),
  update: (id: string, data: Partial<InmuebleItem>) => update<InmuebleItem>("inmuebles", id, data),
  remove: (id: string) => remove("inmuebles", id),
};

export const mueblesService = {
  getAll: () => getAll<MuebleItem>("muebles"),
  getById: (id: string) => getById<MuebleItem>("muebles", id),
  create: (data: Omit<MuebleItem, "id">) => create<MuebleItem>("muebles", data),
  update: (id: string, data: Partial<MuebleItem>) => update<MuebleItem>("muebles", id, data),
  remove: (id: string) => remove("muebles", id),
};

export const vehiculosService = {
  getAll: () => getAll<VehiculoItem>("vehiculos"),
  getById: (id: string) => getById<VehiculoItem>("vehiculos", id),
  create: (data: Omit<VehiculoItem, "id">) => create<VehiculoItem>("vehiculos", data),
  update: (id: string, data: Partial<VehiculoItem>) => update<VehiculoItem>("vehiculos", id, data),
  remove: (id: string) => remove("vehiculos", id),
};

export const herramientasService = {
  getAll: () => getAll<HerramientaItem>("herramientas"),
  getById: (id: string) => getById<HerramientaItem>("herramientas", id),
  create: (data: Omit<HerramientaItem, "id">) => create<HerramientaItem>("herramientas", data),
  update: (id: string, data: Partial<HerramientaItem>) => update<HerramientaItem>("herramientas", id, data),
  remove: (id: string) => remove("herramientas", id),
};

export const stockService = {
  getAll: () => getAll<StockItem>("stock"),
  getById: (id: string) => getById<StockItem>("stock", id),
  create: (data: Omit<StockItem, "id">) => create<StockItem>("stock", data),
  update: (id: string, data: Partial<StockItem>) => update<StockItem>("stock", id, data),
  remove: (id: string) => remove("stock", id),
};

// ========================================
// RESUMEN CONSOLIDADO
// ========================================

export async function getCapitalSummary(): Promise<CapitalSummary> {
  const response = await apiClient.get<ApiResponse<CapitalSummary>>("/api/capital/summary");
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error obteniendo resumen de capital");
  }
  return response.data.data;
}

export default {
  tierras: tierrasService,
  inmuebles: inmueblesService,
  muebles: mueblesService,
  vehiculos: vehiculosService,
  herramientas: herramientasService,
  stock: stockService,
  getSummary: getCapitalSummary,
};
