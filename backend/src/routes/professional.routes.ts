import { Router } from "express";
import {
  createProfessionalProfile,
  updateProfessionalProfile,
  getMyProfessionalProfile,
  getAllProfessionalProfiles,
  verifyProfessional,
  getProfessionalProfileById ,
} from "../controllers/professional.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import express from "express";

const router = Router();

// 👇 Este middleware debe ir ANTES de multer
router.use(express.urlencoded({ extended: true }));

router.use((_req, _res, next) => {

  next();
});

// Crear perfil profesional con archivos
router.post(
  "/",
  authenticateJWT,
  authorizeRoles("PROFESSIONAL", "ADMIN"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  createProfessionalProfile
);

// Actualizar perfil profesional con archivos
router.put(
  "/",
  authenticateJWT,
  authorizeRoles("PROFESSIONAL", "ADMIN"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  updateProfessionalProfile
);

router.get("/me", authenticateJWT, getMyProfessionalProfile);
router.get("/:userId", getProfessionalProfileById);

router.patch("/:id/verify", authenticateJWT, authorizeRoles("ADMIN"), verifyProfessional);


router.get("/", getAllProfessionalProfiles);

export default router;
