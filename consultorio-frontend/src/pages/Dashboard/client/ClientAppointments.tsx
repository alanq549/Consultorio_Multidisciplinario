import { useEffect, useState } from "react";
import { getMyAppointments } from "../../../api/appointments";
import type { Appointment } from "../../../types/appointments";
import type { User } from "../../../types/user";
import ".././../../styles/client/ClientAppointments.css";
const ClientAppointments = () => {
  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const getFullName = (user: User) => {
    return `${user.name} ${user.lastName || ""}`.trim();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        const data = await getMyAppointments();
        console.log("Appointments fetched:", data);
        setAppointments(data);
      } catch (err) {
        setError("Error al cargar tus citas");
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    if (filter === "all") return true;
    return app.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };


  
  if (error) return <div className="error-message">{error}</div>;
  if (loading)
    return <div className="loading-state">Cargando tus citas...</div>;
  if (!appointments.length)
    return (
      <div className="empty-state">
        <svg className="empty-icon" viewBox="0 0 24 24">
          <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
        </svg>
        <h3>No tienes citas programadas</h3>
        <p>Cuando reserves una cita, aparecerá aquí</p>
      </div>
    );

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h2 className="appointments-title">Tus citas</h2>

        <div className="filter-controls">
          <button
            onClick={() => setFilter("all")}
            className={`filter-button ${filter === "all" ? "active" : ""}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`filter-button ${filter === "PENDING" ? "active" : ""}`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter("CONFIRMED")}
            className={`filter-button ${
              filter === "CONFIRMED" ? "active" : ""
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setFilter("COMPLETED")}
            className={`filter-button ${
              filter === "COMPLETED" ? "active" : ""
            }`}
          >
            Completadas
          </button>
          <button
            onClick={() => setFilter("CANCELLED")}
            className={`filter-button ${
              filter === "CANCELLED" ? "active" : ""
            }`}
          >
            Canceladas
          </button>
        </div>
      </div>

      <div className="appointments-grid">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-header">
              <h3 className="service-name">{appointment.service.name}</h3>
              <span
                className={`status-badge ${getStatusColor(appointment.status)}`}
              >
                {appointment.status}
              </span>
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={`${STATIC_URL}${
                    appointment.professional.professionalProfile?.photoUrl ||
                    "/user/default-avatar.png"
                  }`}
                  alt="Foto del profesional"
                />
              </div>
            </div>

            <div className="appointment-details">
              <div className="detail-row">
                <svg className="detail-icon" viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
                </svg>
                <span>{formatDate(appointment.date)}</span>
              </div>

              <div className="detail-row">
                <svg className="detail-icon" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                <span>{formatTime(appointment.startTime)}</span>
              </div>

              <div className="detail-row">
                <svg className="detail-icon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                <span>{getFullName(appointment.professional)}</span>
              </div>

              <div className="detail-row">
                <svg className="detail-icon" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <span>{appointment.professional.email}</span>
              </div>
            </div>

            <div className="appointment-actions">
              {appointment.status === "PENDING" && (
                <button className="action-button cancel-buttonC_h">
                  Cancelar cita
                </button>
              )}
              {appointment.status === "CONFIRMED" && (
                <button className="action-button reschedule-button">
                  Reagendar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientAppointments;
