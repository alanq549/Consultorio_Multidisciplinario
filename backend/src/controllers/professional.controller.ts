import { Request, Response } from "express";
import prisma from "../prisma";

// Crear perfil profesional (solo un perfil por userId)
export const createProfessionalProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.user?.id);


  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  const { specialtyId, description, socialLinks } = req.body;

  // Multer guarda archivos en req.files
  const photoFile = (req.files as any)?.photo?.[0];
  const certificateFiles = (req.files as any)?.certificates || [];

  try {
    const existingProfile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (existingProfile) {
      res.status(400).json({ message: "Perfil profesional ya existe" });
      return;
    }

    const photoUrl = photoFile ? `/uploads/photos/${photoFile.filename}` : null;
    const certificates = certificateFiles.map((file: Express.Multer.File) => `/uploads/certificates/${file.filename}`);

    const profile = await prisma.professionalProfile.create({
      data: {
        userId,
        specialtyId: Number(specialtyId),
        description,
        photoUrl,
        certificates,
        socialLinks: socialLinks ? JSON.parse(socialLinks) : null, // Por si envías JSON string
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

  if (!userId) {
    res.status(401).json({ message: "No autorizado" });
    return;
  }

  const { specialtyId, description, socialLinks } = req.body;

  const photoFile = (req.files as any)?.photo?.[0];
  const certificateFiles = (req.files as any)?.certificates || [];

  try {
    const photoUrl = photoFile ? `/uploads/photos/${photoFile.filename}` : undefined;

    // ✅ Certificados existentes (rutas que siguen válidas)
    let existingCertificates = req.body.existingCertificates || [];

    // Puede venir como string si hay uno solo
    if (typeof existingCertificates === "string") {
      existingCertificates = [existingCertificates];
    }

    // ✅ Certificados nuevos (archivos subidos)
    const newCertificates = certificateFiles.map((file: Express.Multer.File) => 
      `/uploads/certificates/${file.filename}`
    );

    const allCertificates = [...existingCertificates, ...newCertificates];

    const updateData: any = {
      specialtyId: Number(specialtyId),
      description,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
    };

    if (photoUrl) updateData.photoUrl = photoUrl;

    // ⚠️ Ahora siempre actualizamos certificados, incluso si el array está vacío (porque borraron todos)
    updateData.certificates = allCertificates;

    const profile = await prisma.professionalProfile.update({
      where: { userId },
      data: updateData,
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

// GET /api/professionals/:id
export const getProfessionalProfileById = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
const profile = await prisma.professionalProfile.findUnique({
  where: { userId: Number(userId) },
  include: { specialty: true, user: true },
});

    if (!profile) {
      res.status(404).json({ message: "Perfil profesional no encontrado" });
      return;
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener perfil profesional" });
  }
};
