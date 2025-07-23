import { apiFetch } from "./base";
import type { CreateScheduleInput, Schedule } from "../types/schedule";

// Obtener horarios del profesional actual
export async function getMySchedule(): Promise<Schedule[]> {
  return apiFetch("/schedule/me");
}

// Crear nuevos horarios - sigue esperando array de CreateScheduleInput
export async function createSchedule(entries: CreateScheduleInput[]): Promise<Schedule[]> {
  return apiFetch("/schedule/me", {
    method: "POST",
    body: JSON.stringify(entries),
  });
}

// Actualizar horario individual
export async function updateSchedule(id: number, data: Partial<CreateScheduleInput>): Promise<Schedule> {
  return apiFetch(`/schedule/me/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Eliminar horario
export async function deleteSchedule(id: number): Promise<{ message: string }> {
  return apiFetch(`/schedule/${id}`, { method: "DELETE" });
}