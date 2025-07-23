import prisma from "../prisma";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function createDefaultAdmin() {
  try {
    const adminEmail = "alanqff1@gmail.com";
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log("Admin ya existe, no se crea.");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin1234", SALT_ROUNDS);

    const adminUser = await prisma.user.create({
      data: {
        name: "Administrador",
        lastName: "Default",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        phone: null,
      },
    });

    console.log("Admin creado:", adminUser.email);
  } catch (error) {
    console.error("Error creando admin por defecto:", error);
  }
}
