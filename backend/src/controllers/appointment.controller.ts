import { Request, Response } from "express";
import prisma from "../prisma";
import { isTimeAvailable } from "../utils/appointment.utils"; //funcion para validar que no se agenden dos al mismo horario

export const getAllAppointments = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
        guestClient: true, // <--- agregado
        service: true,
        professional: true,
      },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener citas" });
  }
};
// Obtener citas del usuario autenticado (como cliente)
export const getMyAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: userId },
      include: {
        client: true,
        guestClient: true, // <--- agregado, para contemplar posibilidad futura aunque raro que un clientId tenga guestClient
        service: true,
        professional: {
          include: {
            professionalProfile: true, // ✅ esto sí trae el photoUrl y todo lo que hay en el perfil
          },
        },
      },
      orderBy: { date: "desc" },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus citas" });
  }
};

/// obtener citas de un professional autenticado
export const professionalGetMyAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "no autorizado" });
    return;
  }
  try {
    const AppointmentsByProfessional = await prisma.appointment.findMany({
      where: { professionalId: userId },
      include: {
        client: true,
        guestClient: true,
        service: true,
        review: true, // Prisma podrá incluir la review vinculada

        professional: {
          include: {
            professionalProfile: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });
    res.json(AppointmentsByProfessional);
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "error al obtener citas del profesional" });
  }
};

export const createAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authenticatedUser = req.user; // contiene id y role
  const { serviceId, professionalId, date, startTime, notes, clientId } =
    req.body;
  // AHORA: professionalId es el USER ID del profesional

  if (!authenticatedUser) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  // Determinar el ID del cliente final
  let finalClientId: number | null = null;

  if (authenticatedUser.role === "CLIENT") {
    finalClientId = authenticatedUser.id;
  } else if (
    authenticatedUser.role === "PROFESSIONAL" ||
    authenticatedUser.role === "ADMIN"
  ) {
    if (!clientId) {
      res.status(400).json({ message: "Falta el ID del cliente" });
      return;
    }
    finalClientId = Number(clientId);
  } else {
    res.status(403).json({ message: "Rol no autorizado para crear cita" });
    return;
  }

  try {
    // Validar cliente
    const clientUser = await prisma.user.findUnique({
      where: { id: finalClientId! },
    });
    if (!clientUser || clientUser.role !== "CLIENT") {
      res.status(400).json({ message: "Cliente inválido para la cita" });
      return;
    }

    // Obtener perfil profesional a partir de userId
    const professionalProfile = await prisma.professionalProfile.findFirst({
      where: { userId: professionalId },
      include: { user: true },
    });

    if (
      !professionalProfile ||
      professionalProfile.user.role !== "PROFESSIONAL"
    ) {
      res.status(400).json({ message: "Profesional inválido para la cita" });
      return;
    }

    // Validar que el servicio exista y pertenezca a ese profesional
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { professional: true },
    });
    if (!service || service.professional.userId !== professionalId) {
      res
        .status(400)
        .json({ message: "Servicio inválido para este profesional" });
      return;
    }

    // Profesional solo puede agendar sobre su perfil
    if (
      authenticatedUser.role === "PROFESSIONAL" &&
      authenticatedUser.id !== professionalId
    ) {
      res
        .status(403)
        .json({ message: "No puedes crear una cita con otro profesional" });
      return;
    }

    // Validar disponibilidad
    const isAvailable = await isTimeAvailable(
      professionalProfile.id, // el ID real del perfil profesional
      new Date(date),
      startTime
    );

    if (!isAvailable) {
      res.status(400).json({ message: "Horario no disponible" });
      return;
    }
    // Crear cita con el ID del perfil profesional (NO el userId)
    const appointment = await prisma.appointment.create({
      data: {
        clientId: finalClientId,
        serviceId,
        professionalId: professionalId, // ¡Aquí debes usar el User.id, que recibiste en el body!
        date: new Date(date),
        startTime,
        status: "PENDING",
        notes,
      },
    });
    res.status(201).json(appointment);
  } catch (error: any) {
    console.error("💥 Error al crear cita:", error);
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Horario ya reservado por otro cliente" });
    } else {
      res.status(500).json({ message: "Error al crear cita" });
    }
  }
};

export const updateAppointmentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);
  const { status } = req.body;

  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar cita" });
  }
};

export const deleteAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const id = Number(req.params.id);
  try {
    // Mejor que borrar físicamente, puedes plantear un soft-delete cambiando estado
    await prisma.appointment.delete({ where: { id } });
    res.json({ message: "Cita eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar cita" });
  }
};

// controllers/appointment.controller.ts
export const getAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  const professionalId = Number(req.params.professionalId);
  const dateStr = req.query.date as string; // YYYY-MM-DD

  // Parseamos manual para evitar problemas de zona horaria
  const [year, month, day] = dateStr.split("-").map(Number);
  const jsDate = new Date(year, month - 1, day);
  const dayOfWeek = jsDate.getDay();

  console.log("Fecha original:", dateStr);
  console.log("Fecha JS:", jsDate.toString());
  console.log("DayOfWeek:", dayOfWeek);

  try {
    const schedule = await prisma.schedule.findMany({
      where: {
        professionalId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    if (schedule.length === 0) {
      res.json({ date: dateStr, availableTimes: [] });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        date: jsDate,
      },
    });

    const takenTimes = appointments.map((a:any) => a.startTime);

    const availableTimes = schedule.flatMap((block:any) => {
      const times: string[] = [];
      let [hour, minute] = block.startTime.split(":").map(Number);
      const [endHour, endMinute] = block.endTime.split(":").map(Number);

      while (hour < endHour || (hour === endHour && minute < endMinute)) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        if (!takenTimes.includes(time)) {
          times.push(time);
        }
        minute += 30;
        if (minute >= 60) {
          minute = 0;
          hour++;
        }
      }
      return times;
    });

    res.json({ date: dateStr, availableTimes });
  } catch (error) {
    console.error("❗ Error en getAvailability:", error);
    res.status(500).json({ message: "Error al obtener disponibilidad" });
  }
};

// Crear cita para cliente ocasional (solo PROFESIONAL o ADMIN)
export const createAppointmentForGuest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  const { guestClient, serviceId, professionalId, date, startTime, notes } =
    req.body;

  const { name, email, phone } = guestClient || {};
  if (!userId || !req.user) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  if (req.user.role !== "PROFESSIONAL" && req.user.role !== "ADMIN") {
    res.status(403).json({ message: "Acceso denegado" });
    return;
  }

  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { professional: true },
    });

    if (!service || service.professional.userId !== professionalId) {
      res
        .status(400)
        .json({ message: "Servicio inválido para este profesional" });
      return;
    }

    const isAvailable = await isTimeAvailable(
      professionalId,
      new Date(date),
      startTime
    );
    if (!isAvailable) {
      res.status(400).json({ message: "Horario no disponible" });
      return;
    }

    const guestClientRecord = await prisma.guestClient.create({
      data: {
        name,
        email: email || undefined,
        phone: phone || undefined,
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        guestClientId: guestClientRecord.id,
        serviceId,
        professionalId,
        date: new Date(date),
        startTime,
        status: "PENDING",
        notes,
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al crear cita para cliente ocasional" });
  }
};

/// proximas citas 
export const getUpcomingAppointmentsForProfessional = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const now = new Date();

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId: userId,
        date: {
          gte: new Date(now.toISOString().split("T")[0]), // solo a partir de hoy
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" }
      ],
      include: {
        client: true,
        guestClient: true,
        service: true,
      },
      take: 5, // Limita a las próximas 5
    });

    res.json(upcomingAppointments);
  } catch (error) {
    console.error("Error al obtener próximas citas:", error);
    res.status(500).json({ message: "Error al obtener próximas citas" });
  }
};

/// grafico
export const getAppointmentsStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    const appointmentsByDay = await prisma.appointment.groupBy({
      by: ["date"],
      where: {
        professionalId: userId,
        date: {
          gte: today,
        },
      },
      _count: {
        _all: true,
      },
    });

    const result = days.map((date) => {
      const found = appointmentsByDay.find((a:any) => a.date.toISOString().startsWith(date));
      return {
        date,
        count: found?._count._all ?? 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
};


