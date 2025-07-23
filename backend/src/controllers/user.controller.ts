import { Request, Response } from "express";
import prisma from "../prisma";

// GET /api/users
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        professionalProfile: {
          include: {
            specialty: true,
          },
        },
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      res.status(401).json({ message: "No autorizado" });
      return;
    }

    const { name, lastName, phone } = req.body;

    // Foto subida (opcional)
    const photoFile = (req.files as any)?.photo?.[0];
    const photoUrl = photoFile ? `/uploads/photos/${photoFile.filename}` : undefined;

    // Buscar usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }, // Solo traemos el rol
    });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    // Actualización base para todos los usuarios
    const updateUserData: any = {
      name,
      lastName,
      phone,
    };

    if (user.role === "PROFESSIONAL") {
      // Si es profesional, actualizamos la foto en el perfil profesional
      if (photoUrl) {
        await prisma.professionalProfile.update({
          where: { userId },
          data: { photoUrl },
        });
      }
    } else {
      // Si NO es profesional, actualizamos la foto en el usuario (avatar)
      if (photoUrl) {
        updateUserData.avatar = photoUrl;
      }
    }

    // Actualizamos los datos comunes del usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
    });

    res.json({ message: "Usuario actualizado", user: updatedUser });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error interno al actualizar usuario" });
  }
};

