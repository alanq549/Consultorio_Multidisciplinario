import { Request, Response } from "express";
import prisma from "../prisma";

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        professional: {
          include: {
            user: true,
            specialty: true,
          },
        },
      },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener servicios" });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        professional: {
          include: {
            user: true,
            specialty: true,
          },
        },
      },
    });
    if (!service) {
      res.status(404).json({ message: "Servicio no encontrado" });
      return;
    }
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener servicio" });
  }
};

// GET /api/service/professional/:id
export const getServicesByProfessional = async (req: Request, res: Response) => {
  const professionalId = Number(req.params.id);

  try {
    const services = await prisma.service.findMany({
      where: { professionalId, isActive: true },
      include: {
        professional: {
          include: {
            user: true,
            specialty: true,
          },
        },
      },
    });
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener servicios del profesional" });
  }
};

export const createService = async (req: Request, res: Response): Promise<any> => {
  const { name, description, durationMinutes, price } = req.body;
  const userId = req.user?.id; // del token JWT

  try {
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      return res.status(403).json({ message: "Perfil profesional no encontrado" });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        durationMinutes,
        price,
        professionalId: professional.id,
        isActive: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear servicio" });
  }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  const { name, description, durationMinutes, price, isActive } = req.body;
  try {
    const service = await prisma.service.update({
      where: { id },
      data: { name, description, durationMinutes, price, isActive },
    });
    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar servicio" });
  }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    // Mejor poner isActive = false para no perder datos
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
    res.json({ message: "Servicio desactivado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar servicio" });
  }
};

export const getMyServices = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const professional = await prisma.professionalProfile.findUnique({
      where: { userId },
    });

    if (!professional) {
      res.status(404).json({ message: "Perfil profesional no encontrado" });
      return;
    }

    const services = await prisma.service.findMany({
      where: {
        professionalId: professional.id,
        isActive: true,
      },
      include: {
        professional: {
          include: {
            user: true,
            specialty: true,
          },
        },
      },
    });

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener servicios del profesional autenticado" });
  }
};
