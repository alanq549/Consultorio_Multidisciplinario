import cron from "node-cron";
import prisma from "../prisma";
import { isBefore } from "date-fns";
import { zonedTimeToUtc } from 'date-fns-tz';


// Tolerancia en minutos
const TOLERANCIA_MINUTOS = 5;

// Tarea que corre cada 5 minutos
export const startCancelExpiredAppointmentsJob = () => {
  cron.schedule("*/2 * * * *", async () => {
    //console.log("⏱️ Ejecutando job de cancelación de citas expiradas...");
    const now = new Date();
    try {
      const pendingAppointments = await prisma.appointment.findMany({
        where: {
          status: "PENDING",
        },
      });

      for (const appointment of pendingAppointments) {
        const [year, month, day] = [
          appointment.date.getFullYear(),
          appointment.date.getMonth(),
          appointment.date.getDate(),
        ];

        const [hour, minute] = appointment.startTime.split(":").map(Number);
const localTime = `${year}-${month + 1}-${day}T${hour
  .toString()
  .padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;


const appointmentDateTime = zonedTimeToUtc(localTime, "America/Costa_Rica");

        const expirationTime = new Date(
          appointmentDateTime.getTime() + TOLERANCIA_MINUTOS * 60000
        );
        if (isBefore(expirationTime, now)) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: "CANCELLED" },
          });

          console.log(
            `❌ Cita ID ${appointment.id} cancelada automáticamente.
            \n con fecha ${appointmentDateTime}` 
          );
        }
      }
    } catch (error) {
      console.error("💥 Error en cron de cancelación:", error);
    }
  });
};

export const startCompleteFinishedAppointmentsJob = () => {
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    try {
      const confirmedAppointments = await prisma.appointment.findMany({
        where: {
          status: "CONFIRMED",
        },
        include: {
          service: true, // Necesitamos `durationMinutes`
        },
      });

      for (const appointment of confirmedAppointments) {
        // Crear el Date del inicio (local, sin UTC offset)
        const [hour, minute] = appointment.startTime.split(":").map(Number);
        const start = new Date(
          appointment.date.getFullYear(),
          appointment.date.getMonth(),
          appointment.date.getDate(),
          hour,
          minute
        );

        // Calcular fecha/hora de finalización
        const end = new Date(start.getTime() + appointment.service.durationMinutes * 60000);

        if (isBefore(end, now)) {
          await prisma.appointment.update({
            where: { id: appointment.id },
            data: { status: "COMPLETED" },
          });

          console.log(`✅ Cita ID ${appointment.id} marcada como COMPLETED automáticamente.`);
        }
      }
    } catch (error) {
      console.error("💥 Error en cron de completar citas:", error);
    }
  });
};