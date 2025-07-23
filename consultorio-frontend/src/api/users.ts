// api/users.ts
import { apiFetch } from "./base";
import type { User } from "../types/user"; // o decláralo arriba si está local

export function getAllUsers(): Promise<User[]> {
  return apiFetch<User[]>("/users");
}

export async function updateUser(data: {
  name: string;
  lastName?: string;
  phone?: string;
  photo?: File | null;
}): Promise<{ message: string; user: User }> {
  const formData = new FormData();

  formData.append("name", data.name);
  if (data.lastName) formData.append("lastName", data.lastName);
  if (data.phone) formData.append("phone", data.phone);
  if (data.photo) formData.append("photo", data.photo);

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/update`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al actualizar usuario");
  }

  return response.json(); // Esto devuelve { message: string, user: User }
}

