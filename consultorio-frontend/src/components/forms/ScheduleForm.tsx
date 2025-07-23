import { useState } from "react";
import type { WeekDay } from "../../types/schedule";
import { createSchedule } from "../../api/schedule";
import "../../styles/form/ScheduleForm.css";

interface Props {
  onSuccess: () => void;
  onClose?: () => void;
}

const dias: WeekDay[] = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const ScheduleFormMultiDays = ({ onSuccess, onClose }: Props) => {
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>(["Lunes"]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (day: WeekDay) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (startTime >= endTime) {
      setError("La hora de inicio debe ser anterior a la hora de fin");
      return;
    }
    if (selectedDays.length === 0) {
      setError("Selecciona al menos un día");
      return;
    }

    const dayMap: Record<string, number> = {
      Domingo: 0,
      Lunes: 1,
      Martes: 2,
      Miércoles: 3,
      Jueves: 4,
      Viernes: 5,
      Sábado: 6,
    };

    const scheduleEntriesToSend = selectedDays.map((day) => ({
      dayOfWeek: dayMap[day],
      startTime,
      endTime,
    }));

    setLoading(true);
    try {
      await createSchedule(scheduleEntriesToSend);
      onSuccess();
      setSelectedDays(["Lunes"]);
      setStartTime("09:00");
      setEndTime("17:00");
      if (onClose) onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar horario");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="multi-day-form-containersc">
      <form onSubmit={handleSubmit} className="multi-day-formsc">
        <div className="form-sectionsc">
          <h3 className="section-titlesc">Días de la semana</h3>
          <div className="days-gridsc">
            {dias.map((day) => (
              <label 
                key={day} 
                className={`day-checkboxsc ${selectedDays.includes(day) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="hidden"
                />
                {day.substring(0, 3)}
              </label>
            ))}
          </div>
        </div>

        <div className="form-sectionsc">
          <h3 className="section-titlesc">Horario</h3>
          <div className="time-inputssc">
            <div className="time-input-groupsc">
              <label className="time-labelsc">Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="time-inputsc"
              />
              <span className="time-displaysc">{formatTimeDisplay(startTime)}</span>
            </div>

            <div className="time-input-groupsc">
              <label className="time-labelsc">Fin</label>
               <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="time-inputsc"
              />
              <span className="time-displaysc">{formatTimeDisplay(endTime)}</span>
            </div>
          </div>
        </div>

        {error && <p className="form-errorsc">{error}</p>}

        <div className="form-actionssc">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="cancel-buttonsc"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="submit-buttonsc"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinnersc"></span>
                Guardando...
              </>
            ) : (
              "Guardar horarios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleFormMultiDays;