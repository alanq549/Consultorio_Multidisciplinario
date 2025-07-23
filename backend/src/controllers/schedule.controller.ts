// src/controllers/schedule.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

// Obtener el horario de un profesional
export const getScheduleByProfessional = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });
    
    if (!professional) {
      res.status(404).json({ message: "Perfil profesional no encontrado" });
      return;
    }
    const schedule = await prisma.schedule.findMany({
      where: { professionalId: professional.id },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el horario" });
  }
};

// Crear o actualizar horario de un día específico
export const upsertSchedule = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const entries = req.body as Array<{ dayOfWeek: number; startTime: string; endTime: string; isAvailable?: boolean }>;
  try {
    const professional = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!professional) {
      res.status(403).json({ message: "Perfil profesional no encontrado" });
      return;
    }

    const results = [];
    for (const entry of entries) {
      const schedule = await prisma.schedule.upsert({
        where: { professionalId_dayOfWeek: { professionalId: professional.id, dayOfWeek: entry.dayOfWeek } },
        update: { startTime: entry.startTime, endTime: entry.endTime, isAvailable: entry.isAvailable ?? true },
        create: { professionalId: professional.id, dayOfWeek: entry.dayOfWeek, startTime: entry.startTime, endTime: entry.endTime, isAvailable: entry.isAvailable ?? true },
      });
      results.push(schedule);
    }

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar horario" });
  }
};


// Eliminar horario de un día
export const deleteSchedule = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const id = Number(req.params.id);

  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: { professional: true },
    });

    if (!schedule || schedule.professional.userId !== userId) {
      res.status(403).json({ message: "No autorizado o no encontrado" });
      return;
    }

    await prisma.schedule.delete({ where: { id } });

    res.status(200).json({ message: "Horario eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar horario" });
  }
};
