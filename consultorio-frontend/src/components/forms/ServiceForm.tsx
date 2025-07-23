import { useEffect, useState } from "react";
import type { CreateServiceInput, Service } from "../../api/services";
import { createService, updateService } from "../../api/services";
import "../../styles/form/ServiceForm.css";

interface Props {
  onSuccess: () => void;
  editingService: Service | null;
  onClose?: () => void;
  isModal?: boolean;
}

const ServiceForm = ({ onSuccess, editingService, onClose }: Props) => {
  const [form, setForm] = useState<
    Omit<CreateServiceInput, "price"> & { price: string }
  >({
    name: "",
    description: "",
    durationMinutes: 30,
    price: "0",
  });

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingService) {
      const h = Math.floor(editingService.durationMinutes / 60);
      const m = editingService.durationMinutes % 60;

      setForm({
        name: editingService.name,
        description: editingService.description,
        durationMinutes: editingService.durationMinutes,
        price: editingService.price.toString(),
      });

      setHours(h);
      setMinutes(m);
    }
  }, [editingService]);

  const updateDuration = (h: number, m: number) => {
    const total = h * 60 + m;
    setForm((prev) => ({ ...prev, durationMinutes: total }));
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = Number(e.target.value);
    setHours(h);
    updateDuration(h, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = Number(e.target.value);
    setMinutes(m);
    updateDuration(hours, m);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const totalMinutes = hours * 60 + minutes;

    const priceNumber = Number(form.price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      setError("Precio inválido");
      setLoading(false);
      return;
    }

    if (totalMinutes === 0) {
      setError("La duración no puede ser 0 minutos");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      durationMinutes: totalMinutes,
      price: priceNumber,
    };
    try {
      if (editingService) {
        await updateService(editingService.id, payload);
      } else {
        await createService(payload);
      }

      setForm({ name: "", description: "", durationMinutes: 30, price: "0" });
      setHours(0);
      setMinutes(30);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Error al guardar el servicio");
    } finally {
      setLoading(false);
    }
  };

  const hourOptions = Array.from({ length: 9 }, (_, i) => i); // 0, 1, 2, ..., 23
  const minuteOptions = [0, 15, 30, 45];

  return (
<div className="service-form-container overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-teal-500 dark:scrollbar-thumb-teal-400 scrollbar-track-transparent">
      {onClose ? (
        <div className="modal-header">
          <h2 className="modal-title">
            {editingService ? "Editar servicio" : "Nuevo servicio"}
          </h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
      ) : (
        <h2 className="service-form-title">
          {editingService ? "Editar servicio" : "Crear nuevo servicio"}
        </h2>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="service-form-label">
            Nombre del servicio
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Ej. Consulta psicológica"
            value={form.name}
            onChange={handleChange}
            required
            className="service-form-input"
          />
        </div>

        <div>
          <label htmlFor="description" className="service-form-label">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe el servicio que ofreces..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="service-form-textarea"
          />
        </div>

        <div>
          <label className="service-form-label">Duración</label>
          <div className="service-duration-selector">
            <select
              value={hours}
              onChange={handleHoursChange}
              className="service-duration-select"
              aria-label="Horas"
            >
              {hourOptions.map((h) => (
                <option key={h} value={h}>
                  {h} hr{h !== 1 ? "s" : ""}
                </option>
              ))}
            </select>

            <select
              value={minutes}
              onChange={handleMinutesChange}
              className="service-duration-select"
              aria-label="Minutos"
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </div>

        </div>

        <div>
          <label htmlFor="price" className="service-form-label">
            Precio (MXN)
          </label>
          <input
            id="price"
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="0.00"
            min={0}
            step={0.01}
            className="service-form-input"
          />
        </div>

        {error && <p className="service-form-error">{error}</p>}

        <button
          type="submit"
          className="service-form-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="service-form-spinner" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
              </svg>
              {editingService ? "Guardando..." : "Creando..."}
            </>
          ) : editingService ? (
            "Guardar cambios"
          ) : (
            "Crear servicio"
          )}
        </button>
      </form>
    </div>
  );
};

export default ServiceForm;
