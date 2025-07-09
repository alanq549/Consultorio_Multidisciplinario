import { Request, Response } from "express";
import prisma from "../prisma";

// Crear perfil profesional (solo un perfil por userId)
export const createProfessionalProfile = async (req: Request, res: Response): Promise<void> => {
  const { specialtyId, description, certificates, photoUrl, socialLinks } = req.body;
  const userId = Number(req.user?.id);

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const existingProfile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      res.status(400).json({ message: "Perfil profesional ya existe" });
      return;
    }

    const profile = await prisma.professionalProfile.create({
      data: {
        userId,
        specialtyId,
        description,
        certificates,
        photoUrl,
        socialLinks,
      },
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear perfil profesional" });
  }
};

// Actualizar perfil profesional
export const updateProfessionalProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.user?.id);
  const { specialtyId, description, certificates, photoUrl, socialLinks } = req.body;

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const profile = await prisma.professionalProfile.update({
      where: { userId },
      data: {
        specialtyId,
        description,
        certificates,
        photoUrl,
        socialLinks,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar perfil profesional" });
  }
};

// Obtener perfil profesional por userId (del token)
export const getMyProfessionalProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.user?.id);

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  try {
    const profile = await prisma.professionalProfile.findUnique({
      where: { userId },
      include: { specialty: true, user: true },
    });

    if (!profile) {
      res.status(404).json({ message: "Perfil no encontrado" });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil profesional" });
  }
};

// Listar perfiles profesionales (con filtros opcionales)
export const getAllProfessionalProfiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const profiles = await prisma.professionalProfile.findMany({
      include: { specialty: true, user: true },
    });
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfiles profesionales" });
  }
};

// PATCH /api/professionals/:id/verify
export const verifyProfessional = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isVerified } = req.body;

  if (typeof isVerified !== "boolean") {
    res.status(400).json({ message: "isVerified debe ser booleano" });
    return;
  }

  try {
    const professional = await prisma.professionalProfile.update({
      where: { id: Number(id) },
      data: { isVerified },
    });

    res.json({ message: `Profesional ${isVerified ? "aprobado" : "rechazado"}`, professional });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error actualizando profesional" });
  }
};