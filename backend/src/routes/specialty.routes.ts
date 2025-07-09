// src/routes/specialty.routes.ts
import { Router } from "express";
import {
  getAllSpecialties,
  getSpecialtyById,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
} from "../controllers/specialty.controller";
import { authenticateJWT, authorizeRoles } from "../middlewares/auth.middleware";

const router = Router();

// Helper to wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get("/", asyncHandler(getAllSpecialties));
router.get("/:id", asyncHandler(getSpecialtyById));

// Protegemos las rutas de modificación para admins solamente
router.post("/", authenticateJWT, authorizeRoles("ADMIN"), asyncHandler(createSpecialty));
router.put("/:id", authenticateJWT, authorizeRoles("ADMIN"), asyncHandler(updateSpecialty));
router.delete("/:id", authenticateJWT, authorizeRoles("ADMIN"), asyncHandler(deleteSpecialty));

export default router;
