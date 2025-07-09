import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import specialtyRoutes from "./routes/specialty.routes";
import professionalRoutes from "./routes/professional.routes";
import serviceRoutes from "./routes/service.routes";
import appointmentRoutes from "./routes/appointment.routes";
import { errorHandler } from "./middlewares/error.middleware";



const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);




export default app;
