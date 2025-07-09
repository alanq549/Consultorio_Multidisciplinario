import { Router } from "express";
import {
  createProfessionalProfile,
  updateProfessionalProfile,
  getMyProfessionalProfile,
  getAllProfessionalProfiles,
  verifyProfessional,
} from "../controllers/professional.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Solo profesionales o admins pueden crear/actualizar su perfil
router.post("/", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), createProfessionalProfile);
router.put("/", authenticateJWT, authorizeRoles("PROFESSIONAL", "ADMIN"), updateProfessionalProfile);
router.patch("/:id/verify",  authenticateJWT, authorizeRoles("ADMIN"),verifyProfessional);
// Cualquiera autenticado puede obtener su perfil (cliente o profe)
router.get("/me", authenticateJWT, getMyProfessionalProfile);

// Obtener todos los perfiles (para mostrar listado a clientes)
router.get("/", getAllProfessionalProfiles);

export default router;
