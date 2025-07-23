// src/routes/service.routes.ts
import { Router } from "express";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServicesByProfessional, 
  getMyServices,
} from "../controllers/service.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllServices);
router.get("/:id", getServiceById);

// Solo profesionales o admins pueden crear/editar/borrar servicios
router.post("/", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), createService);
router.put("/:id", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), updateService);
router.delete("/:id", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), deleteService);
router.get("/professional/me", authenticateJWT, authorizeRoles("PROFESSIONAL"), getMyServices);

router.get("/professional/:id", getServicesByProfessional);



export default router;
