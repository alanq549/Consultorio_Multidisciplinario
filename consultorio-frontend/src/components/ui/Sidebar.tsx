import { useState, type JSX } from "react";
import {
  LayoutDashboard,
  Users,
  Book,
  Settings,
  CalendarClock,
  UserCog,
  History,
  CalendarPlus,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import "../../styles/ui/Sidebar.css";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const linksByRole: Record<string, { label: string; path: string; icon: JSX.Element }[]> = {
    ADMIN: [
      { label: "Dashboard", path: "/dashboard/admin", icon: <LayoutDashboard size={20} /> },
      { label: "Usuarios", path: "/dashboard/admin/users", icon: <Users size={20} /> },
      { label: "Especialidades", path: "/dashboard/admin/specialties", icon: <Book size={20} /> },
      { label: "Servicios", path: "/dashboard/admin/services", icon: <Settings size={20} /> },
      { label: "Citas", path: "/dashboard/admin/appointments", icon: <CalendarClock size={20} /> },
    ],
    PROFESSIONAL: [
      { label: "Dashboard", path: "/dashboard/professional", icon: <LayoutDashboard size={20} /> },
      { label: "Mi Perfil", path: "/dashboard/professional/profile", icon: <UserCog size={20} /> },
      { label: "Servicios", path: "/dashboard/professional/services", icon: <Settings size={20} /> },
      { label: "Agenda", path: "/dashboard/professional/schedule", icon: <CalendarPlus size={20} /> },
      { label: "Citas", path: "/dashboard/professional/appointments", icon: <CalendarClock size={20} /> },
    ],
    CLIENT: [
      { label: "Dashboard", path: "/dashboard/client", icon: <LayoutDashboard size={20} /> },
      { label: "Reservar Cita", path: "/dashboard/client/book", icon: <CalendarPlus size={20} /> },
      { label: "Mis Citas", path: "/dashboard/client/appointments", icon: <CalendarClock size={20} /> },
      { label: "Historial", path: "/dashboard/client/history", icon: <History size={20} /> },
    ],
  };

  const handleLogout = () => {
    logout();
    setModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <aside
        className={cn(
          "sidebar",
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed"
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex-1 px-2">
          <nav className="sidebar-nav">
            {linksByRole[user.role].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "sidebar-link",
                  isActive(link.path) && "sidebar-link-active"
                )}
              >
                {link.icon}
                <span className={cn("sidebar-label", !isExpanded && "hidden")}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="sidebar-divider">
          <div className="flex items-center gap-3 mb-2">
            <div className="sidebar-avatar">{user.name?.[0]}</div>
            {isExpanded && (
              <div>
                <p className="sidebar-user">{user.name}</p>
                <p className="sidebar-role">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {modalOpen && (
        <div className="sidebar-modal-overlay">
          <div className="sidebar-modal">
            <h3 className="sidebar-modal-title">¿Cerrar sesión?</h3>
            <p className="sidebar-modal-text">¿Seguro que quieres cerrar sesión?</p>
            <div className="flex justify-around">
              <button onClick={handleLogout} className="sidebar-modal-button-yes">
                Sí
              </button>
              <button onClick={() => setModalOpen(false)} className="sidebar-modal-button-no">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
