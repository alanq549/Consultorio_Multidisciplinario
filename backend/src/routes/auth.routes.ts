import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate.middleware";
import { register, login } from "../controllers/auth.controller";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  validateRequest,
  login
);

export default router;
