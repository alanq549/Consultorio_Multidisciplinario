import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "../styles/register.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "CLIENT" as "CLIENT" | "PROFESSIONAL",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await registerUser(form);
      navigate("/login", { state: { registrationSuccess: true } });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error al procesar tu registro.");
      }
    }
  };

  const renderStepOne = () => (
    <>
      <div className="form-group">
        <label htmlFor="role" className="form-label">
          Tipo de Registro
        </label>
        <select
          id="role"
          name="role"
          className="register-select"
          value={form.role}
          onChange={handleChange}
        >
          <option value="CLIENT">Paciente</option>
          <option value="PROFESSIONAL">Profesional de la Salud</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="name" className="form-label">
          Nombre(s)
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: María"
          className="register-input"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName" className="form-label">
          Apellidos
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          placeholder="Ej: González Pérez"
          className="register-input"
          value={form.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Correo Electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Ej: tu@email.com"
          className="register-input"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <button type="button" onClick={nextStep} className="register-button">
        Siguiente
      </button>
    </>
  );

  const renderStepTwo = () => (
    <>
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          className="register-input"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirmar Contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Repite la contraseña"
          className="register-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Ej: +52 55 1234 5678"
          className="register-input"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="register-button bg-gray-500 hover:bg-gray-600 w-1/3"
        >
          Atrás
        </button>
        <button type="submit" className="register-button w-2/3 ml-4">
          Completar Registro
        </button>
      </div>
    </>
  );

  return (
    <div className="register-bg">
      <div className="register-container">
        <div className="register-header">
          <a href="/">
            <img
              src="/login&register/imglogo.png"
              alt="Logo del Consultorio"
              className="register-logo"
            />
          </a>
          <h1 className="register-title">Registro</h1>
          <p className="register-subtitle">
            {step === 1
              ? "Completa tus datos básicos"
              : "Completa tu información de acceso"}
          </p>
        </div>

        {error && (
          <div className="register-error">
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

        <form onSubmit={handleSubmit} className="register-form">
          {step === 1 ? renderStepOne() : renderStepTwo()}
        </form>

        <div className="register-footer">
          <p>
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="register-link">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
