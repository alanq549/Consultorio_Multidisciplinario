import { apiFetch } from "./base";

import type { ProfessionalProfile } from "../types/user";

export interface Service {
  professionalId: number;
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  professional?: ProfessionalProfile; // 👈 AÑADE ESTO
}

export interface CreateServiceInput {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

export const createService = async (data: CreateServiceInput): Promise<Service> => {
  return apiFetch<Service>("/services", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getAllServices = async (): Promise<Service[]> => {
  return apiFetch<Service[]>("/services");
};

export const getServiceById = async (id: number): Promise<Service> => {
  return apiFetch<Service>(`/services/${id}`);
};

export const getMyServices = async (): Promise<Service[]> => {
  return apiFetch<Service[]>("/services/professional/me"); // 🔥 aquí no se pasa ID
};


export const getServicesByProfessional = async (id: number): Promise<Service[]> => {
  return apiFetch<Service[]>(`/services/professional/${id}`);
};


export const updateService = async (
  id: number,
  data: Partial<CreateServiceInput> & { isActive?: boolean }
): Promise<Service> => {
  return apiFetch<Service>(`/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteService = async (id: number): Promise<{ message: string }> => {
  return apiFetch<{ message: string }>(`/services/${id}`, {
    method: "DELETE",
  });
};
