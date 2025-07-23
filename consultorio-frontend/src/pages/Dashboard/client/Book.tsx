import { useEffect, useState } from "react";
import { getAllSpecialties, type Specialty } from "../../../api/specialties";
import { getAllProfessionalProfiles } from "../../../api/professionals";
import { getServicesByProfessional, type Service } from "../../../api/services";
import {
  getAvailability,
  createClientAppointment,
} from "../../../api/appointments";
import type { ProfessionalProfile } from "../../../types/user";
import ".././../../styles/client/Book.css";
import { useAuthStore } from "../../../store/authStore";
import { useModal } from "../../../components/context/useModal"; // Ajustá la ruta si es necesario

interface StepState {
  specialty?: Specialty;
  professional?: ProfessionalProfile;
  service?: Service;
  date?: string;
  time?: string;
}

const Book = () => {
  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";
  const { user } = useAuthStore();

  const [step, setStep] = useState<StepState>({});
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<
    ProfessionalProfile[]
  >([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specs, profs] = await Promise.all([
          getAllSpecialties(),
          getAllProfessionalProfiles(),
        ]);
        setSpecialties(specs);
        setProfessionals(profs);
        // NO cargues servicios aquí
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setError("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // 1) Carga inicial de especialidades y perfiles profesionales
    const fetchData = async () => {
      try {
        const [specs, profs] = await Promise.all([
          getAllSpecialties(),
          getAllProfessionalProfiles(),
        ]);
        setSpecialties(specs);
        setProfessionals(profs);
        // NO cargamos servicios aquí porque dependen de un profesional seleccionado
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setError("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // 2) Cargar servicios del profesional seleccionado (usa profile.id)
    const fetchServices = async () => {
      if (!step.professional?.id) return;
      try {
        const servs = await getServicesByProfessional(step.professional.id);
        setServices(servs);
      } catch (err) {
        console.error("Error al cargar servicios del profesional:", err);
        setError("No se pudieron cargar los servicios.");
      }
    };
    fetchServices();
  }, [step.professional]);

  useEffect(() => {
    // 3) Filtrar servicios activos que pertenecen al profesional seleccionado (usa profile.id)
    if (step.professional) {
      const filtered = services.filter(
        (s) => s.isActive && s.professionalId === step.professional!.id
      );
      setFilteredServices(filtered);
      // Resetea la selección de servicio cuando cambia el profesional o los servicios
      setStep((prev) => ({ ...prev, service: undefined }));
    }
  }, [step.professional, services]);

  useEffect(() => {
    // 4) Filtrar profesionales según la especialidad seleccionada (usa profile.specialty.id)
    if (step.specialty) {
      const filtered = professionals.filter(
        (p) => p.specialty.id === step.specialty!.id
      );
      setFilteredProfessionals(filtered);
      // Resetea profesional y servicio si cambia la especialidad
      setStep((prev) => ({
        ...prev,
        professional: undefined,
        service: undefined,
      }));
    }
  }, [step.specialty, professionals]);

  useEffect(() => {
    // 5) (Redundante con 3) Filtrar servicios activos por profesional
    // Se puede eliminar o combinar con el useEffect 3 para evitar duplicar código
    if (step.professional) {
      const filtered = services.filter(
        (s) => s.isActive && s.professionalId === step.professional!.id
      );
      setFilteredServices(filtered);
      setStep((prev) => ({ ...prev, service: undefined }));
    }
  }, [step.professional, services]);

  function parseDateToLocal(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateToYYYYMMDD(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

  useEffect(() => {
    const fetchAvailability = async () => {
      if (step.professional && step.date) {
        try {
const localDate = parseDateToLocal(step.date);
const dateForBackend = formatDateToYYYYMMDD(localDate);
          const res = await getAvailability(
            step.professional.id!,
            dateForBackend
          );
          setAvailableTimes(res.availableTimes);
        } catch (error) {
          console.error("Error al obtener disponibilidad:", error);
          setError("Error al obtener disponibilidad");
        }
      }
    };
    fetchAvailability();
  }, [step.date, step.professional]);

  // 7) Filtrar especialidades para búsqueda
  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // 8) Confirmar cita: aquí está el punto clave: debes enviar userId del profesional, no profile.id
  const handleConfirm = async () => {
    if (!step.service || !step.professional || !step.date || !step.time) return;
    setLoading(true);

    console.log("Creando cita con:", {
      clientId: user?.id,
      serviceId: step.service.id,
      professionalId: step.professional.userId, // <--- CAMBIO AQUÍ: enviar userId del profesional
      date: step.date,
      startTime: step.time,
    });

    try {
      await createClientAppointment({
        clientId: user?.id as number,
        serviceId: step.service.id,
        professionalId: step.professional.userId!, // Aquí también
        date: step.date,
        startTime: step.time,
      });
      alert("Cita reservada exitosamente");
      setStep({});
    } catch (error) {
      console.log("Error creando cita:", error);
      alert("Error al crear la cita");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };

  const { showModal } = useModal();

  const handleCancel = () => {
    console.log("handleCancel llamado"); // <-- chequeo 1

    if (loading) {
      console.log("loading activo, no hace nada"); // chequeo 2
      return;
    }

    showModal({
      title: "¿Cancelar reserva?",
      message: "¿Estás seguro de que quieres cancelar esta cita?",
      confirmText: "Sí, cancelar",
      cancelText: "No",
      onConfirm: () => {
        console.log("Confirmación modal: cancelar cita"); // chequeo 3
        setStep({});
        setError(null);
        setAvailableTimes([]);
        setFilteredProfessionals([]);
        setFilteredServices([]);
        setSearchTerm("");
      },
      onCancel: () => {
        console.log("Cancelación modal sin confirmar"); // chequeo 4
        // opcional: acciones si cancela
      },
    });
  };

  return (
    <div className="booking-container">
      <h1 className="booking-title">Reservar cita</h1>

      {/* Buscador */}
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar especialidades..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 1. Especialidad */}
      {!step.specialty && (
        <div className="selection-section">
          <h2 className="section-title">Selecciona una especialidad</h2>
          <div className="cards-grid">
            {filteredSpecialties.map((specialty) => (
              <div
                key={specialty.id}
                className="selection-card"
                onClick={() => setStep({ specialty })}
              >
                <div className="card-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                  </svg>
                </div>
                <h3 className="card-title">{specialty.name}</h3>
                <p className="card-description">
                  {specialty.description || "Especialidad médica"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Profesional */}
      {step.specialty && !step.professional && (
        <div className="selection-section">
          <div className="section-header">
            <button className="back-button" onClick={() => setStep({})}>
              <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Volver
            </button>
            <h2 className="section-title">Selecciona un profesional</h2>
          </div>
          <div className="cards-grid">
            {filteredProfessionals.map((professional) => (
              <div
                key={professional.user?.id}
                className="professional-cardC"
                onClick={() => setStep((prev) => ({ ...prev, professional }))}
              >
                <div className="professional-avatarC">
                  {/**deveria ser */}
                  <img
                    src={`${STATIC_URL}${
                      professional?.photoUrl || "/default-avatar.png"
                    }`}
                    alt="Foto del profesional"
                  />{" "}
                </div>
                <div className="professional-infoC">
                  <h3 className="professional-nameC">
                    {professional.user?.name} {professional.user?.lastName}
                  </h3>
                  <p className="professional-specialtyC">
                    {step.specialty?.name}
                  </p>
                  <p className="professional-descriptionC">
                    {professional.description || "Profesional de la salud"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Servicio */}
      {step.professional && !step.service && (
        <div className="selection-section">
          <div className="section-header">
            <button
              className="back-button"
              onClick={() => setStep((prev) => ({ specialty: prev.specialty }))}
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Volver
            </button>
            <h2 className="section-title">Selecciona un servicio</h2>
          </div>
          <div className="services-gridC">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="service-cardC"
                onClick={() => setStep((prev) => ({ ...prev, service }))}
              >
                <div className="service-iconC">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div className="service-detailsC">
                  <h3 className="service-nameC">{service.name}</h3>
                  <p className="service-descriptionC">
                    {service.description || "Servicio profesional"}
                  </p>
                  <div className="service-metaC">
                    <span className="service-durationC">
                      {Math.floor(service.durationMinutes / 60)}h{" "}
                      {service.durationMinutes % 60}m
                    </span>
                    <span className="service-priceC">
                      ${service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Fecha */}
      {step.service && !step.date && (
        <div className="selection-section">
          <div className="section-header">
            <button
              className="back-button"
              onClick={() =>
                setStep((prev) => ({
                  specialty: prev.specialty,
                  professional: prev.professional,
                }))
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Volver
            </button>
            <h2 className="section-title">Selecciona una fecha</h2>
          </div>
          <div className="date-picker-container">
            <input
              type="date"
              className="date-input"
              value={step.date || ""}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setStep((prev) => ({
                  ...prev,
                  date: e.target.value,
                  time: undefined,
                }))
              }
            />
          </div>
        </div>
      )}

      {/* 5. Horario */}
      {step.date && !step.time && (
        <div className="selection-section">
          <div className="section-header">
            <button
              className="back-button"
              onClick={() =>
                setStep((prev) => ({
                  specialty: prev.specialty,
                  professional: prev.professional,
                  service: prev.service,
                  date: undefined,
                }))
              }
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Volver
            </button>
            <h2 className="section-title">Selecciona un horario</h2>
          </div>

          {availableTimes.length > 0 ? (
            <div className="time-slots-grid ">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  className="time-slot dark:bg-zinc-700"
                  onClick={() => setStep((prev) => ({ ...prev, time }))}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-availability">
              <p>No hay horarios disponibles para esta fecha.</p>
              <button
                className="back-button"
                onClick={() =>
                  setStep((prev) => ({
                    specialty: prev.specialty,
                    professional: prev.professional,
                    service: prev.service,
                    date: undefined,
                  }))
                }
              >
                Elegir otra fecha
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. Confirmar */}
      {step.time && (
        <div className="confirmation-section">
          <div className="confirmation-card">
            <h2 className="confirmation-title">Resumen de tu cita</h2>

            <div className="confirmation-detail">
              <span className="detail-label">Especialidad:</span>
              <span className="detail-value">{step.specialty?.name}</span>
            </div>

            <div className="confirmation-detail">
              <span className="detail-label">Profesional:</span>
              <span className="detail-value">
                {step.professional?.user?.name}{" "}
                {step.professional?.user?.lastName}
              </span>
            </div>

            <div className="confirmation-detail">
              <span className="detail-label">Servicio:</span>
              <span className="detail-value">{step.service?.name}</span>
            </div>

            <div className="confirmation-detail">
              <span className="detail-label">Fecha:</span>
              <span className="detail-value">
  {parseDateToLocal(step.date!).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
              </span>
            </div>

            <div className="confirmation-detail">
              <span className="detail-label">Hora:</span>
              <span className="detail-value">{formatTime(step.time)}</span>
            </div>

            <div className="confirmation-detail">
              <span className="detail-label">Precio:</span>
              <span className="detail-value">
                ${step.service?.price.toFixed(2)}
              </span>
            </div>

            <div
              className="button-group"
              style={{ display: "flex", gap: "10px", marginTop: "20px" }}
            >
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="confirm-button"
              >
                {loading ? (
                  <>
                    <svg className="spinner" viewBox="0 0 24 24">
                      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                    </svg>
                    Procesando...
                  </>
                ) : (
                  "Confirmar cita"
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={loading}
                className="cancel-button"
                style={{
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Book;
