import { Request, Response } from "express";
import prisma from "../prisma";

export const getAllAppointments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        client: true,
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
export const getMyAppointments = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.user?.id);
  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }
  try {
    const appointments = await prisma.appointment.findMany({
      where: { clientId: userId },
      include: {
        service: true,
        professional: true,
      },
      orderBy: { date: "desc" },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tus citas" });
  }
};

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.user?.id);
  const { serviceId, professionalId, date, startTime, notes } = req.body;

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    // Validar que profesional y servicio existen y que servicio pertenece al profesional
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service || service.professionalId !== professionalId) {
      res.status(400).json({ message: "Servicio inválido para este profesional" });
      return;
    }

    // Crear cita
    const appointment = await prisma.appointment.create({
      data: {
        clientId: userId,
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
    res.status(500).json({ message: "Error al crear cita" });
  }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
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

export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
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
