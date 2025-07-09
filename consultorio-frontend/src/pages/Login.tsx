import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const { token, user } = await loginUser(form);
    login(user, token);

    type Role = "ADMIN" | "CLIENT" | "PROFESSIONAL";
    const role = user.role as Role;

    const redirectByRole: Record<Role, string> = {
      ADMIN: "/dashboard/admin",
      CLIENT: "/dashboard/client",
      PROFESSIONAL: "/dashboard/professional",
    };

    const defaultPath = redirectByRole[role] || "/dashboard";

    // Validar que el "next" sea válido para ese rol
    if (next && next.startsWith(defaultPath)) {
      navigate(next);
    } else {
      navigate(defaultPath);
    }

  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Ocurrió un error inesperado.");
    }
  }
};


  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Iniciar Sesión</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="email" type="email" placeholder="Email" className="input" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" className="input" value={form.password} onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Entrar</button>
      </form>
    </div>
  );
}
