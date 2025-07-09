// src/routes/user.routes.ts
import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/me",
  authenticateJWT,
  (req, res) => {
    res.json({ message: `Hola ${req.user?.role}, tu ID es ${req.user?.id}` });
  }
);

router.get(
  "/admin-only",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  (_req, res) => {
    res.json({ message: "Solo los administradores ven esto" });
  }
);

export default router;
