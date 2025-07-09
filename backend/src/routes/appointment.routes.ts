// src/routes/appointment.routes.ts
import { Router } from "express";
import {
  getAllAppointments,
  getMyAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "../controllers/appointment.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Rutas para clientes autenticados
router.get("/my", authenticateJWT, authorizeRoles("CLIENT"), getMyAppointments);
router.post("/", authenticateJWT, authorizeRoles("CLIENT"), createAppointment);

// Rutas para admins o profesionales (para gestión)
router.get("/", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), getAllAppointments);
router.put("/:id/status", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), updateAppointmentStatus);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), deleteAppointment);

export default router;
