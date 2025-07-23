// src/routes/schedule.routes.ts
import { Router } from "express";
import {
  getScheduleByProfessional,
  upsertSchedule,
  deleteSchedule,
} from "../controllers/schedule.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Obtener el horario del profesional autenticado
router.get(
  "/me",
  authenticateJWT,
  authorizeRoles("PROFESSIONAL"),
  getScheduleByProfessional
);

// Crear o actualizar horario por día
router.post(
  "/me",
  authenticateJWT,
  authorizeRoles("PROFESSIONAL"),
  upsertSchedule
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("PROFESSIONAL"),
  deleteSchedule
);

export default router;
