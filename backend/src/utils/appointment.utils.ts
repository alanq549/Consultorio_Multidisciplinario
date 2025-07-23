import prisma from "../prisma";

// utils/appointment.utils.ts (si quieres moverlo ahí)
export async function isTimeAvailable(
  professionalId: number,
  date: Date,
  startTime: string
): Promise<boolean> {
  const appointment = await prisma.appointment.findFirst({
    where: {
      professionalId,
      date,
      startTime,
    },
  });

  return !appointment; // true si NO hay cita ocupando esa hora
}
