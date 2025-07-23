import { useEffect, useState } from "react";
import { getMySchedule, deleteSchedule } from "../../../api/schedule";
import type { Schedule } from "../../../types/schedule";
import ScheduleForm from "../../../components/forms/ScheduleForm";
import "../../../styles/professional/SchedulePage.css";
import { useModal } from "../../../components/context/useModal"; // Ajustá la ruta si es necesario

const weekDayMap: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

const SchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"week" | "day">("week");

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await getMySchedule();
      console.log("schedule recibido", data);
      setSchedules(data);
    } catch (error) {
      console.error("Error al cargar la agenda:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const { showModal } = useModal();

  const handleDelete = (id: number) => {
    showModal({
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar este horario?",
      confirmText: "Sí, eliminar",
      cancelText: "No",
      onConfirm: async () => {
        try {
          setDeletingId(id);
          await deleteSchedule(id);
          await fetchSchedule();
        } catch (error) {
          console.error("Error al eliminar:", error);
        } finally {
          setDeletingId(null);
        }
      },
      onCancel: () => {
        // opcional, si quieres hacer algo cuando cancela
      },
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${
      hour >= 12 ? "PM" : "AM"
    }`;
  };
  // Agrupar por día para la vista diaria
  const groupedByDay = schedules.reduce((acc, item) => {
    if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = [];
    acc[item.dayOfWeek].push(item);
    return acc;
  }, {} as Record<number, Schedule[]>);

  // Agrupar por rango de hora para la vista semanal
  const groupedByTime = schedules.reduce((acc, item) => {
    const key = `${item.startTime}-${item.endTime}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Ordenar los grupos por hora de inicio
  const sortedGroups = Object.entries(groupedByTime).sort(
    ([timeA], [timeB]) => {
      return timeA.localeCompare(timeB);
    }
  );

  // Ordenar los días de la semana
  const sortedDays = Object.entries(groupedByDay).sort(([dayA], [dayB]) => {
    return parseInt(dayA) - parseInt(dayB);
  });

return (
  <div className="schedule-container">
    <div className="schedule-header">
      <div>
        <h1 className="schedule-title">Mi Agenda</h1>
        <p className="schedule-subtitle">
          Organiza y gestiona tus horarios de disponibilidad para atender a tus pacientes
        </p>
      </div>
      <button
        onClick={() => setShowFormModal(true)}
        className="add-schedule-button"
        aria-label="Agregar nuevo horario"
      >
        <svg className="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        Agregar horario
      </button>
    </div>

    {/* Modal para agregar horario */}
    {showFormModal && (
      <div className={`modal-overlay ${showFormModal ? 'visible' : ''}`}>
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">Agregar horario</h2>
            <button
              onClick={() => setShowFormModal(false)}
              className="modal-close"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
          </div>
          <ScheduleForm
            onSuccess={() => {
              setShowFormModal(false);
              fetchSchedule();
            }}
            onClose={() => setShowFormModal(false)}
          />
        </div>
      </div>
    )}

    <section className="availability-section">
      <div className="view-options">
        <button
          className={`view-option ${activeTab === "week" ? "active" : ""}`}
          onClick={() => setActiveTab("week")}
        >
          Vista por horario
        </button>
        <button
          className={`view-option ${activeTab === "day" ? "active" : ""}`}
          onClick={() => setActiveTab("day")}
        >
          Vista por día
        </button>
      </div>

      <h2 className="availability-title">Disponibilidad actual</h2>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando tu agenda...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-container">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3>No hay horarios configurados</h3>
          <p>Comienza agregando tus primeros horarios de disponibilidad</p>
          <button
            onClick={() => setShowFormModal(true)}
            className="add-schedule-button empty-button"
          >
            <svg className="plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Crear horario
          </button>
        </div>
      ) : activeTab === "week" ? (
        <div className="schedule-grid">
          {sortedGroups.map(([timeRange, items]) => {
            const [startTime, endTime] = timeRange.split("-");
            const days = items
              .map((i) => ({
                name: weekDayMap[i.dayOfWeek],
                id: i.id,
                dayOfWeek: i.dayOfWeek,
              }))
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

            return (
              <div key={timeRange} className="schedule-card">
                <div className="time-range">
                  <span className="time-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <span className="time-text">{formatTime(startTime)}</span>
                    <span className="time-separator">—</span>
                    <span className="time-text">{formatTime(endTime)}</span>
                  </div>
                </div>

                <div className="days-list">
                  {days.map(({ name, id }) => (
                    <div key={id} className="day-item">
                      <span className="day-name">{name}</span>
                      <button
                        onClick={() => handleDelete(id)}
                        className="delete-button"
                        disabled={deletingId === id}
                        aria-label={`Eliminar horario del ${name}`}
                      >
                        {deletingId === id ? (
                          <span className="deleting-text">Eliminando...</span>
                        ) : (
                          <svg
                            className="trash-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="day-view-container">
          {sortedDays.map(([day, items]) => (
            <div key={day} className="day-card">
              <div className="day-header">
                <h3 className="day-title">{weekDayMap[parseInt(day)]}</h3>
              </div>
              <div className="day-time-slots">
                {items
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((item) => (
                    <div key={item.id} className="time-slot">
                      <div className="slot-time">
                        <svg className="slot-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {formatTime(item.startTime)} -{" "}
                          {formatTime(item.endTime)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-button"
                        disabled={deletingId === item.id}
                        aria-label={`Eliminar horario de ${
                          weekDayMap[item.dayOfWeek]
                        }`}
                      >
                        {deletingId === item.id ? (
                          <span className="deleting-text">Eliminando...</span>
                        ) : (
                          <svg
                            className="trash-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);
};

export default SchedulePage;
