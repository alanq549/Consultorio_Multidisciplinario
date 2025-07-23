// src/routes/user.routes.ts
import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { getAllUsers, updateUser } from "../controllers/user.controller";
import { upload } from "../middlewares/upload.middleware";



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

router.get("/", getAllUsers);

router.put(
  "/update",
  authenticateJWT,
  authorizeRoles("CLIENT", "PROFESSIONAL", "ADMIN"),
  upload.fields([{ name: "photo", maxCount: 1 }]),
  updateUser
);



export default router;
