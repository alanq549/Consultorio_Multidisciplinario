// src/api/appointments.ts

import type { Appointment } from "../types/appointments";
import { apiFetch } from "./base";

interface GuestAppointmentInput {
  serviceId: number;
  professionalId: number;
  date: string;
  startTime: string;
  notes?: string;
  guestClient: {
    name: string;
    phone?: string;
  };
}

export const createGuestAppointment = (data: GuestAppointmentInput) =>
  apiFetch("/appointments/guest", {
    method: "POST",
    body: JSON.stringify(data),
  });

  export const createClientAppointment = (data: {
  clientId: number; // ✅ AGREGA ESTE CAMPO
  serviceId: number;
  professionalId: number;
  date: string;
  startTime: string;
  notes?: string;
}) =>
  apiFetch("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  });

  export const getAvailability = (professionalId: number, date: string) =>
  apiFetch<{ date: string; availableTimes: string[] }>(
    `/appointments/availability/${professionalId}?date=${date}`
  );

export const getMyAppointments = () =>
  apiFetch<Appointment[]>("/appointments/my")
;

// Obtener las citas del profesional autenticado
export const professionalGetMyAppointments =()=>
  apiFetch<Appointment[]>("/appointments/professsionalApp/my")
;

export const getProfessionalAppointments = () =>
  apiFetch<Appointment[]>("/appointments");

///cambiar el estatus de la cita :
export const updateAppointmentStatus = (
  id: number,
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
) =>
  apiFetch(`/appointments/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  // proximas citas:
export const getUpcomingAppointments = () =>
  apiFetch<Appointment[]>("/appointments/professional/upcoming");


 export interface AppointmentStat {
  date: string;
  count: number;
}
export const getAppointmentStats = async () => {
  return apiFetch<AppointmentStat[]>("/appointments/professional/stats");
};