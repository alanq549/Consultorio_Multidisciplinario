import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import SettingsModal from "./SettingsModal";
import "../../styles/ui/UserMenu.css";

const UserMenu = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button className="user-menu-button" onClick={() => setOpen(!open)}>
        {user.name?.[0] ?? "U"}
      </button>

      {open && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <p className="user-menu-name">{user.name}</p>
            <p className="user-menu-role">{user.role}</p>
          </div>
          <button
            className="user-menu-button-config"
            onClick={() => {
              setShowSettings(true);
              setOpen(false);
            }}
          >
            Configuración
          </button>
          <button
            className="user-menu-button-logout"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default UserMenu;
