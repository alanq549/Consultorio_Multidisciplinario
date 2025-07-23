// src/types/schedule.ts

export interface Schedule {
  id: number;
  dayOfWeek: number; // <- lo agregamos aquí
  startTime: string; // formato HH:mm (24h)
  endTime: string;   // formato HH:mm (24h)
  professionalId: number;
}

export type WeekDay =
  | "Lunes"
  | "Martes"
  | "Miércoles"
  | "Jueves"
  | "Viernes"
  | "Sábado"
  | "Domingo";

export interface CreateScheduleInput {
  dayOfWeek: number;   // 0 = Domingo, 1 = Lunes, etc.
  startTime: string;
  endTime: string;
}


