import { useEffect, useState } from "react";
import {
  professionalGetMyAppointments,
  updateAppointmentStatus,
} from "../../../api/appointments";
import type { Appointment } from "../../../types/appointments";
import AppointmentCreateForm from "../../../components/forms/AppointmentCreateForm";
import "../.././../styles/professional/ProfessionalAppointments.css";
import { useModal } from "../../../components/context/useModal"; // Ajustá la ruta si es necesario

const Appointments = () => {
  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await professionalGetMyAppointments();
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Error al cargar tus citas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === "all") return true;
    return app.status === activeFilter;
  });

  const formatFullDateTime = (dateString: string, time: string) => {
    const [year, month, day] = dateString.split("T")[0].split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    const date = new Date(year, month - 1, day, hour, minute);

    return date.toLocaleString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "professional_pp-status-pending";
      case "CONFIRMED":
        return "professional_pp-status-confirmed";
      case "CANCELLED":
        return "professional_pp-status-cancelled";
      case "COMPLETED":
        return "professional_pp-status-completed";
      default:
        return "professional_pp-status-default";
    }
  };

  const { showModal } = useModal();

  return (
    <div className="professional_pp-container">
      <div className="professional_pp-header">
        <h2 className="professional_pp-title">Gestión de Citas</h2>

        <div className="professional_pp-actions">
          <button
            onClick={() => setModalOpen(true)}
            className="professional_pp-new-button"
          >
            <svg className="professional_pp-plus-icon" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Nueva cita
          </button>
        </div>
      </div>

      <div className="professional_pp-filters">
        <button
          onClick={() => setActiveFilter("all")}
          className={`professional_pp-filter-button ${
            activeFilter === "all" ? "active" : ""
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveFilter("PENDING")}
          className={`professional_pp-filter-button ${
            activeFilter === "PENDING" ? "active" : ""
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setActiveFilter("CONFIRMED")}
          className={`professional_pp-filter-button ${
            activeFilter === "CONFIRMED" ? "active" : ""
          }`}
        >
          Confirmadas
        </button>
        <button
          onClick={() => setActiveFilter("COMPLETED")}
          className={`professional_pp-filter-button ${
            activeFilter === "COMPLETED" ? "active" : ""
          }`}
        >
          Completadas
        </button>
        <button
          onClick={() => setActiveFilter("CANCELLED")}
          className={`professional_pp-filter-button ${
            activeFilter === "CANCELLED" ? "active" : ""
          }`}
        >
          Canceladas
        </button>
      </div>

      {/* Modal para nueva cita */}
      {modalOpen && (
        <div
          className="professional_pp-modal-backdrop"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="professional_pp-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="professional_pp-modal-close"
              aria-label="Cerrar modal"
            >
              <svg viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
            <h3 className="professional_pp-modal-title">Agendar Nueva Cita</h3>
            <AppointmentCreateForm
              onSuccess={() => {
                fetchAppointments();
                setModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="professional_pp-loading">
          <div className="professional_pp-spinner"></div>
          <p>Cargando citas...</p>
        </div>
      ) : error ? (
        <div className="professional_pp-error">
          <p>{error}</p>
          <button
            onClick={fetchAppointments}
            className="professional_pp-retry-button"
          >
            Reintentar
          </button>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="professional_pp-empty">
          <svg className="professional_pp-empty-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
          </svg>
          <h3>
            No hay citas{" "}
            {activeFilter === "all" ? "agendadas" : activeFilter.toLowerCase()}
          </h3>
          <p>Cuando tengas citas, aparecerán aquí</p>
        </div>
      ) : (
        <div className="professional_pp-appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="professional_pp-appointment-card"
            >
              <div className="professional_pp-card-header">
                <h3 className="professional_pp-service-name">
                  {appointment.service.name}
                </h3>
                <span
                  className={`professional_pp-status-badge ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="professional_pp-card-details">
                <div className="professional_pp-detail-row">
                  <svg
                    className="professional_pp-detail-icon"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z" />
                  </svg>
                  <span>
                    {formatFullDateTime(
                      appointment.date,
                      appointment.startTime
                    )}
                  </span>
                </div>
                <div className="professional_pp-detail-row">
                  <img
                    className="professional_pp-detail-avatar"
                    src={
                      appointment.client?.avatar
                        ? `${STATIC_URL}${appointment.client.avatar}`
                        : "/user/default-avatar.png"
                    }
                    alt="Avatar del cliente"
                  />
                  <span>
                    {appointment.client
                      ? `${appointment.client.name} ${
                          appointment.client.lastName || ""
                        }`
                      : appointment.guestClient?.name}
                  </span>
                </div>

                {appointment.notes && (
                  <div className="professional_pp-detail-row">
                    <svg
                      className="professional_pp-detail-icon"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <span className="professional_pp-notes">
                      {appointment.notes}
                    </span>
                  </div>
                )}

                {appointment.status === "PENDING" && (
                  <div className="professional_pp-actions-row">
                    <button
                      className="professional_pp-confirm-button"
                      onClick={async () => {
                        showModal({
                          title: "Confirmar Cita",
                          message: "¿Estás seguro de confirmar esta cita?",
                          confirmText: "si confirmar cita",
                          cancelText: "Cancelar",
                          onConfirm: async () => {
                            try {
                              await updateAppointmentStatus(
                                appointment.id,
                                "CONFIRMED"
                              );
                              fetchAppointments(); // Recarga las citas
                            } catch (err) {
                              console.error("Error al confirmar cita:", err);
                              alert("No se pudo confirmar la cita");
                            }
                          },
                        });
                      }}
                    >
                      Confirmar
                    </button>

                    <button
                      className="professional_pp-cancel-button"
                      onClick={async () => {
                        showModal({
                          title: "Cancelar Cita",
                          message: "¿Estás seguro de cancelar esta cita?",
                          confirmText: "Sí, cancelar",
                          cancelText: "No",
                          onConfirm: async () => {
                            try {
                              await updateAppointmentStatus(
                                appointment.id,
                                "CANCELLED"
                              );
                              fetchAppointments(); // Recarga la lista
                            } catch (err) {
                              console.error("Error al cancelar cita:", err);
                              alert("No se pudo cancelar la cita");
                            }
                          },
                        });
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;
