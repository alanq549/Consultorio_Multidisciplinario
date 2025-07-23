import app from "./app";
import prisma from "./prisma";
import { startCancelExpiredAppointmentsJob, startCompleteFinishedAppointmentsJob } from "./jobs/cancelExpiredAppointments.job";
import { createDefaultAdmin } from "./utils/dminDefault";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Conexión a la base de datos exitosa");

      await createDefaultAdmin(); // crear admin si no existe

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
        startCancelExpiredAppointmentsJob(); // ← Inicia el cron
        startCompleteFinishedAppointmentsJob(); // ← Inicia el cron

    });
  } catch (error) {
    console.error("❌ Error al conectar a la base de datos:");
    console.error(error);
    process.exit(1); // Detiene el servidor
  }
}

startServer();

// Cierre limpio al finalizar
process.on("SIGINT", async () => {
  console.log("🛑 Cerrando servidor...");
  await prisma.$disconnect();
  process.exit(0);
});
