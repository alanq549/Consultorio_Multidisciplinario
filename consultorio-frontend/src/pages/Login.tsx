import { useState } from "react";
import { loginUser } from "../api/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import "../styles/login.css";
import { getMyProfessionalProfile } from "../api/professionals";

export default function Login() {
  const API_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next");
  const login = useAuthStore((state) => state.login);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  console.log("API_URL en login:", API_URL);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { token, user } = await loginUser(form);
      console.log("ver si llega la peticion", API_URL);

      login(user, token); // Guarda en el store
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Si es profesional, carga su perfil completo
      if (user.role === "PROFESSIONAL") {
        try {
          const professionalProfile = await getMyProfessionalProfile();
          user.professionalProfile = professionalProfile;
        } catch (err) {
          console.warn("No se pudo cargar el perfil profesional:", err);
          user.professionalProfile = undefined;
        }
      }

      type Role = "ADMIN" | "CLIENT" | "PROFESSIONAL";
      const role = user.role as Role;

      // Si es profesional y no tiene perfil → redirige a completar perfil
      if (role === "PROFESSIONAL" && !user.hasProfessionalProfile) {
        navigate("/professional/complete-profile");
        return;
      }

      const redirectByRole: Record<Role, string> = {
        ADMIN: "/dashboard/admin",
        CLIENT: "/dashboard/client",
        PROFESSIONAL: "/dashboard/professional",
      };

      const defaultPath = redirectByRole[role] || "/dashboard";

      if (next && next.startsWith(defaultPath)) {
        console.log("primer if", API_URL);
        navigate(next);
      } else {
        navigate(defaultPath);
        console.log("else");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado al acceder al sistema.");
      }
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-header">
          <a href="/">
            <img
              src="/login&register/imglogo.png"
              alt="Logo del Consultorio Médico"
              className="login-logo"
            />
          </a>
          <h1 className="login-title">Acceso Clínico</h1>
          <p className="login-subtitle">Sistema Integral de Gestión Médica</p>
        </div>

        {error && (
          <div className="login-error">
            <svg
              className="inline w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Correo electrónico profesional"
              className="login-input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Contraseña de acceso"
              className="login-input"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button">
            Acceder al Sistema
          </button>
        </form>

        <div className="login-footer">
          <p className="mb-3">
            aun no tienes cuenta?{" "}
            <span className="font-bold">
              <Link to="/register" className="login-link">
                Regístrate aquí!
              </Link>
            </span>{" "}
          </p>
          <p></p>
          <p>
            <Link to="/forgot-password" className="login-link">
              Recuperar credenciales de acceso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
