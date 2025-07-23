import { Router } from "express";
import { createReview, getProfessionalRating, getProfessionalReviews } from "../controllers/reviewController";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Crear reseña - protegido, requiere token y que req.user esté definido
router.post("/", authenticateJWT, createReview);

// Obtener promedio de calificación por profesional
router.get("/professional/:id/rating", getProfessionalRating);

// Obtener todas las reseñas de un profesional
router.get("/professional/:id", getProfessionalReviews);

export default router;
