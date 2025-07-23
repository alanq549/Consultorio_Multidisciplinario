import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../prisma";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Desestructura name y lastName del body
    const {
      name,
      lastName,
      email,
      password,
      role = "CLIENT",
      phone,
    } = req.body;

    // Valida que venga al menos el nombre y email y password
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Nombre, email y contraseña son obligatorios" });
      return;
    }

    // Verifica si ya existe usuario con ese email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Email ya registrado" });
      return;
    }

    // Hashea password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crea usuario
    const user = await prisma.user.create({
      data: {
        name,
        lastName,
        email,
        password: hashedPassword,
        role,
        phone,
      },
    });

    res.status(201).json({ message: "Usuario creado", userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña son obligatorios" });
      return;
    }

    // Busca usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    // Compara password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    // Genera JWT
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET no está definido en las variables de entorno"
      );
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" } as SignOptions
    );

    // Verifica si el usuario tiene perfil profesional
    let hasProfessionalProfile = false;

    let professionalProfile = null;

    if (user.role === "PROFESSIONAL") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId: user.id },
        include: {
          specialty: true,
        },
      });

      hasProfessionalProfile = !!profile;
      if (profile) {
        professionalProfile = {
          id: profile.id,
          userId: profile.userId,
          specialtyId: profile.specialtyId,
          specialty: profile.specialty,
          description: profile.description,
          certificates: profile.certificates,
          isVerified: profile.isVerified,
          photoUrl: profile.photoUrl,
          socialLinks: profile.socialLinks,
        };
      }
    }

    let professionalReviews: any[] = [];

    if (user.role === "PROFESSIONAL") {
      const profile = await prisma.professionalProfile.findUnique({
        where: { userId: user.id },
        include: {
          specialty: true,
        },
      });

      hasProfessionalProfile = !!profile;
      if (profile) {
        professionalProfile = {
          id: profile.id,
          userId: profile.userId,
          specialtyId: profile.specialtyId,
          specialty: profile.specialty,
          description: profile.description,
          certificates: profile.certificates,
          isVerified: profile.isVerified,
          photoUrl: profile.photoUrl,
          socialLinks: profile.socialLinks,
        };

        // Traer reseñas del profesional
        professionalReviews = await prisma.review.findMany({
          where: { professionalId: profile.id },
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
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName ?? undefined,
        email: user.email,
        role: user.role,
        phone: user.phone ?? undefined,
        avatar: user.avatar ?? undefined,
        hasProfessionalProfile,
        ...(professionalProfile && { professionalProfile }),
        ...(professionalReviews.length > 0 && { professionalReviews }), // Añadido aquí
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno" });
  }
};
