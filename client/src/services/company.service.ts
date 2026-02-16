import apiClient from "./apiClient";
import type { ApiResponse } from "./apiTypes";

export interface SetupCompanyData {
  companyName: string;
}

export interface CompanyData {
  id: string;
  name: string;
  createdAt: string;
}

/**
 * Configurar empresa para usuario sin companyId
 */
export async function setupCompany(data: SetupCompanyData): Promise<CompanyData> {
  const response = await apiClient.post<ApiResponse<CompanyData>>(
    "/api/users/setup-company",
    data
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error al configurar empresa");
  }

  return response.data.data;
}

/**
 * Obtener información de la empresa actual
 */
export async function getCompanyInfo(): Promise<CompanyData> {
  const response = await apiClient.get<ApiResponse<CompanyData>>(
    "/api/company"
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || "Error al obtener información de empresa");
  }

  return response.data.data;
}

const companyService = {
  setupCompany,
  getCompanyInfo,
};

export default companyService;
