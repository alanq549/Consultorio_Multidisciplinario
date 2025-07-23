// src/api/professionals.ts
import { apiFetch } from "./base";

import type { ProfessionalProfile } from "../types/user";

// Crear perfil profesional
export async function createProfessionalProfile(data: FormData | {
  specialtyId: number;
  description: string;
  certificates?: string;
  photoUrl?: string;
  socialLinks?: string;
}) {
  const token = localStorage.getItem("token");

  if (data instanceof FormData) {
    // Enviar multipart/form-data con archivos SIN apiFetch, para controlar headers
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/professionals`, {
      method: "POST",
      body: data,
      headers: {
        // Solo Authorization, sin Content-Type, para que fetch lo maneje solo
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error en la petición");
    }

    return res.json() as Promise<ProfessionalProfile>;
  } else {
    // Enviar JSON normal con apiFetch
    return apiFetch<ProfessionalProfile>("/professionals", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

// Actualizar perfil profesional 
export async function updateProfessionalProfile(data: FormData | {
  specialtyId: number;
  description: string;
  certificates?: string[];
  socialLinks?: string;
  photo?: File | null;
}) {
  const token = localStorage.getItem("token");

  if (data instanceof FormData) {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/professionals`, {
      method: "PUT",
      body: data,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar perfil");
    }

    return res.json() as Promise<ProfessionalProfile>;
  } else {
    // Si NO hay archivos, conviértelo en FormData también
    const formData = new FormData();
    formData.append("specialtyId", String(data.specialtyId));
    formData.append("description", data.description);
    formData.append("socialLinks", data.socialLinks ?? "");

    if (Array.isArray(data.certificates)) {
      data.certificates.forEach((c) => {
        formData.append("certificates", c); // Esto si son archivos
      });
    }

    if (data.photo instanceof File) {
      formData.append("photo", data.photo);
    }

    return updateProfessionalProfile(formData);
  }
}

// Obtener tu propio perfil (por token)
export async function getMyProfessionalProfile() {
  return apiFetch<ProfessionalProfile>("/professionals/me");
}


// Obtener todos los perfiles profesionales (para clientes o admin)
export async function getAllProfessionalProfiles() {
  return apiFetch<ProfessionalProfile[]>("/professionals");
}

// Verificar profesional (admin)
export async function verifyProfessional(id: number, isVerified: boolean) {
  return apiFetch(`/professionals/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify({ isVerified }),
  });
}


export async function getProfessionalProfileById(id: number) {
  return apiFetch<ProfessionalProfile>(`/professionals/${id}`);
}
