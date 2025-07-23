import type { User } from "./user";

export interface Appointment {
  id: number;
  clientId?: number | null;
  guestClientId?: number | null;
  serviceId: number;
  professionalId: number;
  date: string;
  startTime: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string | null;
  createdAt: string;
  client?: User;
  guestClient?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  service: {
    id: number;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
  };
  professional: User; // ✅ CAMBIO AQUÍ
}

export interface Service {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  professionalId: number; // 👈 necesario para extraerlo en el formulario
}