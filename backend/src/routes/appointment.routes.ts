// src/routes/appointment.routes.ts
import { Router } from "express";
import {
  getAllAppointments,
  getMyAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  createAppointmentForGuest,
  getAvailability,
  professionalGetMyAppointments,
  getUpcomingAppointmentsForProfessional,
  getAppointmentsStats,

} from "../controllers/appointment.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// ----------------- CLIENTE -----------------
router.get("/my", authenticateJWT, authorizeRoles("CLIENT"), getMyAppointments);
router.post("/", authenticateJWT, authorizeRoles("CLIENT", "PROFESSIONAL"), createAppointment);

// ----------------- PROFESIONAL / ADMIN -----------------
router.post("/guest", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), createAppointmentForGuest);
router.get("/", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), getAllAppointments);
router.put("/:id/status", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), updateAppointmentStatus);
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN", "PROFESSIONAL"), deleteAppointment);
router.get("/professsionalApp/my", authenticateJWT, authorizeRoles("PROFESSIONAL"), professionalGetMyAppointments);
router.get("/professional/upcoming", authenticateJWT, authorizeRoles("PROFESSIONAL"), getUpcomingAppointmentsForProfessional);
router.get("/professional/stats", authenticateJWT, authorizeRoles("PROFESSIONAL"), getAppointmentsStats);



// ----------------- DISPONIBILIDAD -----------------
router.get(
  "/availability/:professionalId",
  authenticateJWT,
  authorizeRoles("CLIENT", "PROFESSIONAL", "ADMIN"),
  getAvailability
);


export default router;
