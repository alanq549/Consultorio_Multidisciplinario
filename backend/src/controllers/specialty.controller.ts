// src/controllers/specialty.controller.ts
import { Request, Response } from "express";
import prisma from "../prisma";

export const getAllSpecialties = async (_req: Request, res: Response) => {
  try {
    const specialties = await prisma.specialty.findMany();
    res.json(specialties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener especialidades" });
  }
};

export const getSpecialtyById = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  try {
    const specialty = await prisma.specialty.findUnique({ where: { id } });
    if (!specialty) {
      res.status(404).json({ message: "Especialidad no encontrada" });
      return;
    }
    res.json(specialty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener especialidad" });
  }
};

export const createSpecialty = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  try {
    const existing = await prisma.specialty.findUnique({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "Especialidad ya existe" });
    }

    const specialty = await prisma.specialty.create({
      data: { name, description },
    });

    res.status(201).json(specialty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear especialidad" });
  }
};

export const updateSpecialty = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  try {
    const specialty = await prisma.specialty.update({
      where: { id },
      data: { name, description },
    });
    res.json(specialty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar especialidad" });
  }
};

export const deleteSpecialty = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  try {
    await prisma.specialty.delete({ where: { id } });
    res.json({ message: "Especialidad eliminada" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar especialidad" });
  }
};
