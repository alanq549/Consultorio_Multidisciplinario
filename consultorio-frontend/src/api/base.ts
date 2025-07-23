// src/api/base.ts
const API_URL = import.meta.env.VITE_BACKEND_URL;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = "Error en la petición";
    try {
      const error = await res.json();
      message = error.message || message;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // respuesta no era JSON, usar mensaje por defecto
    }

    throw new Error(message);
  }

  return res.json();
}
