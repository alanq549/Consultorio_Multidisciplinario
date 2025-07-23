import { Request, Response } from "express";
import prisma from "../prisma";

// Crear una reseña
export const createReview = async (req: Request, res: Response): Promise<void> => {
  const clientId = Number(req.user?.id);
  const { professionalId, rating, comment, appointmentId } = req.body;

  if (!clientId || !professionalId || !rating || !appointmentId) {
    res.status(400).json({ message: "Faltan campos requeridos" });
    return;
  }

  try {
    // Validar que la cita exista y le pertenezca al cliente
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: Number(appointmentId),
        clientId: clientId,
        professionalId: Number(professionalId),
      },
    });

    if (!appointment) {
      res.status(404).json({ message: "Cita no encontrada o no válida" });
      return;
    }

    // Verificar que no exista ya una reseña para esta cita
    const existingReview = await prisma.review.findFirst({
      where: { appointmentId: Number(appointmentId) },
    });

    if (existingReview) {
      res.status(400).json({ message: "Ya existe una reseña para esta cita" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        clientId,
        professionalId: Number(professionalId),
        appointmentId: Number(appointmentId),
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error al crear reseña:", error);
    res.status(500).json({ message: "Error al crear reseña" });
  }
};

// ver las review de una cita:



// Obtener promedio de calificaciones por profesional
export const getProfessionalRating = async (req: Request, res: Response): Promise<void> => {
  const professionalId = Number(req.params.id);

  if (!professionalId) {
    res.status(400).json({ message: "ID de profesional inválido" });
    return;
  }

  try {
    const avg = await prisma.review.aggregate({
      where: { professionalId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    res.json({
      average: avg._avg.rating ?? 0,
      totalReviews: avg._count.rating,
    });
  } catch (error) {
    console.error("Error al obtener calificación:", error);
    res.status(500).json({ message: "Error al obtener calificación" });
  }
};


// Obtener todas las reseñas de un profesional
export const getProfessionalReviews = async (req: Request, res: Response): Promise<void> => {
  const professionalId = Number(req.params.id);

  if (!professionalId) {
    res.status(400).json({ message: "ID de profesional inválido" });
    return;
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { professionalId },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Error al obtener reseñas:", error);
    res.status(500).json({ message: "Error al obtener reseñas" });
  }
};

