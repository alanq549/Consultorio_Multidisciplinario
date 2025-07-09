import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/useTheme";
import { useAuthStore } from "../../store/authStore";
import "../../styles/ui/SettingsModal.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [activeSection, setActiveSection] = useState<string>("general");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-4 text-sm">
            <div>
              <p>🌐 Idioma: Español / Inglés</p>
            </div>
            <hr className="my-4 opc-divider" />
            <div className="settings-switch-container">
              <span className="text-sm">🎨 Tema</span>
              <button
                onClick={toggleTheme}
                className={`settings-switch  ${
                  isDark ? "bg-neutral-600" : "bg-slate-800 border-neutral-600"
                }`}
              >
                <span
                  className={`settings-switch-thumb ${
                    isDark ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        );
 case "account":
  return (
    <div className="space-y-4 text-sm">
      {user && <div className="flex items-center space-x-4">
        <img
          src={user?.photoUrl || "/default-avatar.jpg"}
          alt="Foto de perfil"
          className="w-16 h-16 rounded-full object-cover"
        />
        <button className="text-blue-600 underline text-sm">
          Cambiar foto
        </button>
      </div>}

      <div>
        <label className="block text-xs mb-1">Nombre</label>
        <input
          type="text"
          className="w-full px-2 py-1 border rounded"
          defaultValue={user?.name}
        />
      </div>

      {user?.role === "PROFESSIONAL" && (
        <>
          <div>
            <label className="block text-xs mb-1">Especialidad</label>
            <input
              type="text"
              className="w-full px-2 py-1 border rounded bg-gray-100"
              value={user?.professionalProfile?.specialty?.name || ""}
              disabled
            />
          </div>

          <div>
            <label className="block text-xs mb-1">Descripción</label>
            <textarea
              className="w-full px-2 py-1 border rounded"
              defaultValue={user?.professionalProfile?.description}
            />
          </div>

<div>
  <label className="block text-xs mb-1">Certificados</label>
  <ul className="list-disc list-inside text-xs space-y-1">
    {user?.professionalProfile?.certificates?.map((cert: string, idx: number) => {
      const fileName = cert.split("/").pop(); // extrae solo el nombre
      const isPDF = cert.endsWith(".pdf");
      const isDOC = cert.endsWith(".doc") || cert.endsWith(".docx");

      return (
        <li key={idx} className="flex items-center space-x-2">
          <span>
            {isPDF && "📄"}
            {isDOC && "📝"}
            {!isPDF && !isDOC && "📁"}
          </span>
          <a
            href={cert}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline break-all"
          >
            {fileName}
          </a>
        </li>
      );
    })}
  </ul>
</div>


          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold">Estado:</span>
            {user?.professionalProfile?.isVerified ? (
              <span className="text-green-600 font-semibold">✔ Verificado</span>
            ) : (
              <span className="text-yellow-500 font-semibold">⏳ En revisión</span>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Guardar cambios
        </button>
      </div>
    </div>
  );

      case "apps":
        return (
          <ul className="settings-list space-y-2 text-sm">
            <li>🔗 Google</li>
            <hr className="my-4 opc-divider" />
            <li>🔗 Facebook</li>
            <hr className="my-4 opc-divider" />

            <li>🔗 Google Drive</li>
          </ul>
        );
      case "security":
        return (
          <ul className="settings-list space-y-2 text-sm">
            <li>🔑 Cambiar contraseña</li>
            <hr className="my-4 opc-divider" />
            <li>📧 Cambiar correo electrónico</li>
            <hr className="my-4 opc-divider" />
            <li>🔒 Cerrar sesión en todos los dispositivos</li>
            <hr className="my-4 opc-divider" />
            <li className="settings-danger">❌ Borrar cuenta y datos</li>
          </ul>
        );
      default:
        return <p className="text-sm text-gray-500">Selecciona una sección.</p>;
    }
  };

  return (
    <div className="settings-backdrop">
      <div ref={modalRef} className="settings-modal">
        <button className="settings-close-button" onClick={onClose}>
          ✕
        </button>
        <h2 className="text-2xl font-semibold mb-10">Configuración</h2>

        <div className="grid grid-cols-3 gap-4">
          {/* Columna izquierda: Menú */}
          <div className="col-span-1 border-r pr-4 ">
            <ul className="space-y-2">
              <li>
                <button
                  className={`settings-section-title w-full text-left ${
                    activeSection === "general" ? " section-active" : ""
                  }`}
                  onClick={() => setActiveSection("general")}
                >
                  General
                </button>
              </li>
              <li>
                <button
                  className={`settings-section-title w-full text-left ${
                    activeSection === "account" ? " section-active" : ""
                  }`}
                  onClick={() => setActiveSection("account")}
                >
                  Cuenta
                </button>
              </li>
              <li>
                <button
                  className={`settings-section-title w-full text-left ${
                    activeSection === "apps" ? " section-active" : ""
                  }`}
                  onClick={() => setActiveSection("apps")}
                >
                  Aplicaciones conectadas
                </button>
              </li>

              <li>
                <button
                  className={`settings-section-title w-full text-left ${
                    activeSection === "security" ? " section-active" : ""
                  }`}
                  onClick={() => setActiveSection("security")}
                >
                  Seguridad
                </button>
              </li>
            </ul>
          </div>

          {/* Columna derecha: Contenido */}
          <div className="col-span-2">{renderSectionContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
