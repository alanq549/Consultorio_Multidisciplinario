import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import specialtyRoutes from "./routes/specialty.routes";
import professionalRoutes from "./routes/professional.routes";
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import reviewRoutes from "./routes/review.routes";
import scheduleRoutes from "./routes/schedule.routes";
import  notifications  from "./routes/notifications";


import { errorHandler } from "./middlewares/error.middleware";


const app = express();

// Archivos estáticos

// CORS
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Solo aplicar express.json a rutas que reciben JSON
app.use("/api/auth", express.json(), authRoutes);
app.use("/api/users", userRoutes );
app.use("/api/specialties", express.json(), specialtyRoutes);
app.use("/api/services", express.json(), serviceRoutes);
app.use("/api/appointments", express.json(), appointmentRoutes);
app.use("/api/reviews", express.json(), reviewRoutes);
app.use("/api/schedule", express.json(), scheduleRoutes);
app.use("/api/notifications", express.json(), notifications);



// NOTA: NO aplicar express.json() a /api/professionals (usa multer)

app.use("/api/professionals", professionalRoutes);

// Middleware de errores
app.use(errorHandler);

export default app;
