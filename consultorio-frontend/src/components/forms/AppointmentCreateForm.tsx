import { useState, useEffect } from "react";
import { getAllUsers } from "../../api/users";
import { getMyServices } from "../../api/services";
import {
  createClientAppointment,
  createGuestAppointment,
  getAvailability,
} from "../../api/appointments";
import type { User } from "../../types/user";
import type { Service } from "../../api/services";
import "../../styles/form/AppointmentCreateForm.css";

interface AppointmentCreateFormProps {
  onSuccess?: () => void;
}

const AppointmentCreateForm: React.FC<AppointmentCreateFormProps> = ({
  onSuccess,
}) => {
  const [type, setType] = useState<"registered" | "guest">("registered");
  const [clients, setClients] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState({
    clients: true,
    services: true,
    availability: false,
  });

  const [form, setForm] = useState({
    clientId: "",
    guestName: "",
    guestPhone: "",
    date: "",
    startTime: "",
    serviceId: "",
    notes: "",
  });

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [users, services] = await Promise.all([
          getAllUsers(),
          getMyServices(),
        ]);
        setClients(users.filter((u) => u.role === "CLIENT"));
        setServices(services);
      } catch {
        setMessage({ text: "Error al cargar datos iniciales", type: "error" });
      } finally {
        setLoading((prev) => ({ ...prev, clients: false, services: false }));
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      if (!form.date || !form.serviceId) return;

      const selectedService = services.find(
        (s) => s.id === Number(form.serviceId)
      );
      if (!selectedService?.professionalId) return;

      try {
        setLoading((prev) => ({ ...prev, availability: true }));
        const availability = await getAvailability(
          selectedService.professionalId,
          form.date
        );
        setAvailableTimes(availability.availableTimes);
      } catch (err) {
        console.error("Error al obtener disponibilidad:", err);
        setAvailableTimes([]);
      } finally {
        setLoading((prev) => ({ ...prev, availability: false }));
      }
    }

    fetchAvailability();
  }, [form.date, form.serviceId, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const [year, month, day] = form.date.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();

    today.setHours(0, 0, 0, 0);


    if (selectedDate < today) {
      return setMessage({
        text: "No puedes agendar una cita en una fecha pasada",
        type: "error",
      });
    }

    

    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [hour, minute] = form.startTime.split(":").map(Number);
      const selectedTime = new Date();
      selectedTime.setHours(hour, minute, 0, 0);

      if (selectedTime < now) {
        return setMessage({
          text: "La hora seleccionada ya pasó",
          type: "error",
        });
      }

      if (selectedDate < today) {
        return setMessage({
          text: "No puedes agendar una cita en una fecha pasada",
          type: "error",
        });
      }
    }

    try {
      const selectedService = services.find(
        (s) => s.id === Number(form.serviceId)
      );

      if (!selectedService || !selectedService.professional) {
        return setMessage({
          text: "Servicio inválido o sin profesional asignado",
          type: "error",
        });
      }

      // 🔁 Aquí obtenemos el userId desde el perfil profesional
      const professionalUserId = selectedService.professional.userId;

      if (!professionalUserId) {
        return setMessage({
          text: "No se pudo obtener el ID del profesional",
          type: "error",
        });
      }
      if (type === "registered") {

       
        await createClientAppointment({
          clientId: Number(form.clientId),
          serviceId: Number(form.serviceId),
          professionalId: professionalUserId, // ✅ Este es el que necesita Appointment
          date: form.date,
          startTime: form.startTime,
          notes: form.notes,
        });
        setMessage({ text: "Cita registrada exitosamente", type: "success" });
      } else {
        await createGuestAppointment({
          serviceId: Number(form.serviceId),
          professionalId: professionalUserId,
          date: form.date,
          startTime: form.startTime,
          notes: form.notes,
          guestClient: {
            name: form.guestName,
            phone: form.guestPhone,
          },
        });
        setMessage({
          text: "Cita para cliente ocasional registrada",
          type: "success",
        });
      }

      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error("❌ Error al crear cita:", error);
      setMessage({ text: "Error al registrar la cita", type: "error" });
    }
  };
  const resetForm = () => {
    setForm({
      clientId: "",
      guestName: "",
      guestPhone: "",
      date: "",
      startTime: "",
      serviceId: "",
      notes: "",
    });
    setAvailableTimes([]);
  };

function to12HourFormat(time24: string) {
  const [hour, minute] = time24.split(":").map(Number);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="appointment-form_container">
      <div className="appointment-form_grid">
        {/* Columna izquierda */}
        <div className="appointment-form_column">
          <div className="appointment-form_section">
            <label className="appointment-form_label">Tipo de cliente:</label>
            <div className="client-type_selector">
              <button
                type="button"
                className={`client-type_button ${
                  type === "registered" ? "active" : ""
                }`}
                onClick={() => setType("registered")}
              >
                Cliente registrado
              </button>
              <button
                type="button"
                className={`client-type_button ${
                  type === "guest" ? "active" : ""
                }`}
                onClick={() => setType("guest")}
              >
                Cliente ocasional
              </button>
            </div>
          </div>

          {type === "registered" ? (
            <div className="appointment-form_section">
              <label className="appointment-form_label">
                Cliente registrado:
              </label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="appointment-form_select"
                required
                disabled={loading.clients}
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.lastName}
                  </option>
                ))}
              </select>
              {loading.clients && (
                <div className="loading-indicator_small">
                  Cargando clientes...
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="appointment-form_section">
                <label className="appointment-form_label">
                  Nombre completo:
                </label>
                <input
                  type="text"
                  value={form.guestName}
                  onChange={(e) =>
                    setForm({ ...form, guestName: e.target.value })
                  }
                  className="appointment-form_input"
                  required
                  placeholder="Nombre del cliente ocasional"
                />
              </div>

              <div className="appointment-form_section">
                <label className="appointment-form_label">Teléfono:</label>
                <input
                  type="tel"
                  value={form.guestPhone}
                  onChange={(e) =>
                    setForm({ ...form, guestPhone: e.target.value })
                  }
                  className="appointment-form_input"
                  placeholder="Opcional"
                />
              </div>
            </>
          )}

          <div className="appointment-form_section">
            <label className="appointment-form_label">Servicio:</label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="appointment-form_select"
              required
              disabled={loading.services}
            >
              <option value="">-- Selecciona un servicio --</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (${s.price.toFixed(2)} -{" "}
                  {Math.floor(s.durationMinutes / 60)}h {s.durationMinutes % 60}
                  m)
                </option>
              ))}
            </select>
            {loading.services && (
              <div className="loading-indicator_small">
                Cargando servicios...
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="appointment-form_column">
          <div className="appointment-form_section">
            <label className="appointment-form_label">Fecha:</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              min={today}
              className="appointment-form_input"
              required
            />
          </div>

          <div className="appointment-form_section">
            <label className="appointment-form_label">Hora:</label>
            <select
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="appointment-form_select"
              required
              disabled={availableTimes.length === 0 || loading.availability}
            >
              <option value="">-- Selecciona una hora --</option>
           {availableTimes.map((time) => (
  <option key={time} value={time}>
    {to12HourFormat(time)}
  </option>
))}
            </select>
            {loading.availability && (
              <div className="loading-indicator_small">
                Buscando horarios disponibles...
              </div>
            )}
            {availableTimes.length === 0 &&
              form.date &&
              form.serviceId &&
              !loading.availability && (
                <div className="appointment-form_message error">
                  No hay horarios disponibles para esta fecha
                </div>
              )}
          </div>

          <div className="appointment-form_section">
            <label className="appointment-form_label">Notas adicionales:</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="appointment-form_textarea"
              placeholder="Detalles adicionales sobre la cita"
            />
          </div>
        </div>
      </div>

      <div className="appointment-form_footer">
        <button
          type="submit"
          className="appointment-form_submit"
          disabled={loading.availability}
        >
          {loading.availability ? "Agendando..." : "Agendar cita"}
        </button>

        {message && (
          <div className={`appointment-form_message ${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </form>
  );
};

export default AppointmentCreateForm;
