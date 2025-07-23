// src/api/auth.ts
const API_URL = import.meta.env.VITE_BACKEND_URL;

export async function registerUser(data: {
  name: string;           // ✅ CAMBIADO
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  role: "CLIENT" | "PROFESSIONAL";
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al registrar");
  }

  return res.json();
}



export async function loginUser(data: { email: string; password: string }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Error al iniciar sesión");
  }

  return res.json(); // { token, user }
}
