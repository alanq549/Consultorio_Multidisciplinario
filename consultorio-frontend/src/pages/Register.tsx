import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
    role: "CLIENT" | "PROFESSIONAL";
  }>({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CLIENT",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocurrió un error desconocido.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" type="text" placeholder="Nombre" className="input" value={form.name} onChange={handleChange} required />
        <input name="email" type="email" placeholder="Email" className="input" value={form.email} onChange={handleChange} required />
        <input name="password" type="password" placeholder="Contraseña" className="input" value={form.password} onChange={handleChange} required />
        <input name="phone" type="text" placeholder="Teléfono (opcional)" className="input" value={form.phone} onChange={handleChange} />

        <select name="role" className="input" value={form.role} onChange={handleChange}>
          <option value="CLIENT">Cliente</option>
          <option value="PROFESSIONAL">Profesional</option>
        </select>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Registrarse</button>
      </form>
    </div>
  );
}
