// src/routes/notifications.ts
import { getClientNotifications, getProfessionalNotifications, getAdminNotifications } from "../controllers/notifications";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.get("/professional", authenticateJWT, authorizeRoles("PROFESSIONAL"), getProfessionalNotifications);
router.get("/client", authenticateJWT, authorizeRoles("CLIENT"), getClientNotifications);
router.get("/admin", authenticateJWT, authorizeRoles("ADMIN"), getAdminNotifications);

export default router;
