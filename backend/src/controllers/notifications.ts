// src/controllers/notifications.ts
import { Request, Response } from "express";
import prisma from "../prisma";

interface AppointmentNotification {
  type:
    | "UPCOMING"
    | "COMPLETED"
    | "CANCELLED"
    | "CONFIRMED"
    | "REVIEW_POSTED"
    | "ASSIGNED"
    | "NEW_PROFESSIONAL";
  message: string;
  date: string;
  appointmentId: number | null;
  clientName?: string;
  professionalName?: string;
  reviewedBy?: string;
}

// Función segura para combinar fecha + hora
function combineDateAndTime(date: Date, time: string): string {
  try {
    const [hours, minutes, seconds = "00"] = time.split(":");
    const combined = new Date(date); // copia para no mutar el original
    combined.setHours(Number(hours), Number(minutes), Number(seconds));
    return combined.toISOString();
  } catch (err) {
    console.error("Error combinando fecha y hora:", date, time, err);
    return new Date().toISOString(); // fallback
  }
}

/// admin notification
export const getAdminNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const isAdmin = req.user?.role === "ADMIN";
  if (!isAdmin) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        professional: true,
      },
      orderBy: { date: "desc" },
    });

    const professionals = await prisma.professionalProfile.findMany({
      include: {
        user: true,
        specialty: true,
      },
      orderBy: { id: "desc" },
    });

    const appointmentNotifications: AppointmentNotification[] = appointments.flatMap((appt:any) => {
      const clientName =
        `${appt.client?.name || ""} ${appt.client?.lastName || ""}`.trim() || "Cliente desconocido";
      const professionalName =
        `${appt.professional?.name || ""} ${appt.professional?.lastName || ""}`.trim() || "Profesional desconocido";

const base = {
  appointmentId: appt.id,
  date: combineDateAndTime(appt.date, appt.startTime), // ✅ ahora sí es string
  clientName,
  professionalName,
};

      const notes: AppointmentNotification[] = [];

      if (appt.status === "CONFIRMED") {
        notes.push({
          ...base,
          type: "CONFIRMED",
          message: `Cita confirmada entre ${clientName} y ${professionalName}.`,
        });
      }

      if (appt.status === "COMPLETED") {
        notes.push({
          ...base,
          type: "COMPLETED",
          message: `Cita completada entre ${clientName} y ${professionalName}.`,
        });
      }

      if (appt.status === "CANCELLED") {
        notes.push({
          ...base,
          type: "CANCELLED",
          message: `Cita cancelada entre ${clientName} y ${professionalName}.`,
        });
      }

      return notes;
    });

    const professionalNotifications: AppointmentNotification[] = professionals.map((prof:any) => {
      const user = prof.user;
      const specialty = prof.specialty?.name || "Especialidad no especificada";
      return {
        appointmentId: null,
        date: user.createdAt.toISOString(),
        professionalName: `${user.name} ${user.lastName || ""}`,
        type: "NEW_PROFESSIONAL",
        message: `Nuevo profesional registrado: ${user.name} ${user.lastName || ""} - Especialidad: ${specialty}`,
      };
    });

    const notifications = [...appointmentNotifications, ...professionalNotifications];

    res.json(notifications);
  } catch (error) {
    console.error("Error obteniendo notificaciones para admin:", error);
    res.status(500).json({
      message: "Error interno al obtener notificaciones para admin",
    });
  }
};
/// professional notification
export const getProfessionalNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professionalId = Number(req.user?.id);
  if (!professionalId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }
  try {
    const appointments = await prisma.appointment.findMany({
      where: { professionalId },
      include: {
        client: true,
        guestClient: true,
        review: true,
      },
      orderBy: { date: "asc" },
    });

    const notifications: AppointmentNotification[] = appointments.flatMap(
      (appt:any) => {
        const clientName =
          `${appt.client?.name || ""} ${appt.client?.lastName || ""}`.trim() ||
          appt.guestClient?.name ||
          "Cliente desconocido";
        const base = {
          appointmentId: appt.id,
          date: `${appt.date}T${appt.startTime}`,
          clientName,
        };

        const notes: AppointmentNotification[] = [];

        const isUpcoming =
          new Date(`${appt.date}T${appt.startTime}`) > new Date();
        if (isUpcoming && appt.status === "CONFIRMED") {
          notes.push({
            ...base,
            type: "UPCOMING",
            message: `Tienes una próxima cita con ${clientName}`,
          });
        }

        if (appt.status === "COMPLETED") {
          notes.push({
            ...base,
            type: "COMPLETED",
            message: `Cita con ${clientName} fue completada`,
          });
        }

        if (appt.review) {
          notes.push({
            ...base,
            type: "REVIEW_POSTED",
            message: `¡Recibiste una reseña de ${clientName}!`,
            reviewedBy: clientName,
          });
        }
        return notes;
      }
    );

    res.json(notifications);
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener notificaciones" });
  }
};
/// client notification
export const getClientNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const clientId = Number(req.user?.id);
  if (!clientId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        clientId,
      },
      include: {
        professional: true,
      },
      orderBy: { date: "asc" },
    });

    const notifications: AppointmentNotification[] = appointments.flatMap(
      (appt:any) => {
        const professionalName =
          `${appt.professional?.name || ""} ${
            appt.professional?.lastName || ""
          }`.trim() || "Profesional desconocido";

        const base = {
          appointmentId: appt.id,
          date: `${appt.date}T${appt.startTime}`,
          professionalName,
        };

        const notes: AppointmentNotification[] = [];

        // ✅ Notificación cuando la cita es confirmada
        if (appt.status === "CONFIRMED") {
          notes.push({
            ...base,
            type: "CONFIRMED",
            message: `Tu cita con ${professionalName} ha sido confirmada.`,
          });
        }

        // ✅ Notificación cuando la cita es completada
        if (appt.status === "COMPLETED") {
          notes.push({
            ...base,
            type: "COMPLETED",
            message: `Tu cita con ${professionalName} fue completada.`,
          });
        }

        // ✅ Notificación cuando la cita es cancelada
        if (appt.status === "CANCELLED") {
          notes.push({
            ...base,
            type: "CANCELLED",
            message: `Tu cita con ${professionalName} fue cancelada.`,
          });
        }

        return notes;
      }
    );

    res.json(notifications);
  } catch (error) {
    console.error("Error obteniendo notificaciones del cliente:", error);
    res
      .status(500)
      .json({ message: "Error interno al obtener notificaciones" });
  }
};
// deleted notification
