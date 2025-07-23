import multer from "multer";
import path from "path";
import fs from "fs";

// Asegurarse que las carpetas existan
const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const photosDir = path.join(__dirname, "../../uploads/photos");
const certificatesDir = path.join(__dirname, "../../uploads/certificates");

ensureDirExists(photosDir);
ensureDirExists(certificatesDir);

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    if (file.fieldname === "photo") {
      cb(null, photosDir);
    } else if (file.fieldname === "certificates") {
      cb(null, certificatesDir);
    } else {
      cb(new Error("Campo de archivo no soportado"), "");
    }
  },
  filename: function (_req, file, cb) {
    // Nombre único para evitar colisiones: timestamp + nombre original sin espacios
    const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueSuffix);
  },
});

export const upload = multer({ storage });
