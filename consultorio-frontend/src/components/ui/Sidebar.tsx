import { useState, useEffect, type JSX } from "react";
import {
  LayoutDashboard,
  Users,
  Book,
  Settings,
  CalendarClock,
  UserCog,
  CalendarPlus,
  Menu,
  X,
  Box,
  ToolCase,
  TrendingUp ,
  MessageSquare ,

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
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px es el breakpoint típico para móviles
    };

    handleResize(); // Verificar al montar el componente
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const linksByRole: Record<
    string,
    { label: string; path: string; icon: JSX.Element }[]
  > = {
    ADMIN: [
      {
        label: "Dashboard",
        path: "/dashboard/admin",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Usuarios",
        path: "/dashboard/admin/users",
        icon: <Users size={20} />,
      },
      {
        label: "Especialidades",
        path: "/dashboard/admin/specialties",
        icon: <Book size={20} />,
      },
      {
        label: "Servicios",
        path: "/dashboard/admin/services",
        icon: <Box  size={20} />,
      },
      {
        label: "Citas",
        path: "/dashboard/admin/appointments",
        icon: <CalendarClock size={20} />,
      },
      {
        label: "Reportes",
        path: "/dashboard/admin/reports",
        icon: <TrendingUp  size={20} />,
      },
      {
        label: "Configuración",
        path: "/dashboard/admin/configuration",
        icon: <ToolCase size={20} />,
      },
      {
        label: "Soporte ",
        path: "/dashboard/admin/support",
        icon: <MessageSquare  size={20} />,
      },
    ],
    PROFESSIONAL: [
      {
        label: "Dashboard",
        path: "/dashboard/professional",
        icon: <LayoutDashboard size={20} />,
      },
      {
        label: "Mi Perfil",
        path: "/dashboard/professional/profile",
        icon: <UserCog size={20} />,
      },
      {
        label: "Servicios",
        path: "/dashboard/professional/services",
        icon: <Settings size={20} />,
      },
      {
        label: "Agenda",
        path: "/dashboard/professional/schedule",
        icon: <CalendarPlus size={20} />,
      },
      {
        label: "Citas",
        path: "/dashboard/professional/appointments",
        icon: <CalendarClock size={20} />,
      },
    ],
CLIENT: [
  {
    label: "Dashboard",
    path: "/dashboard/client",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Reservar Cita",
    path: "/dashboard/client/book",
    icon: <CalendarPlus size={20} />,
  },
  {
    label: "Citas",
    path: "/dashboard/client/appointments",
    icon: <CalendarClock size={20} />,
  },
],

  };

  const handleLogout = () => {
    logout();
    setModalOpen(false);
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Botón para móviles */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed z-40 top-2 left-2 p-2 rounded-md bg-teal-100 text-teal-800 dark:bg-zinc-700 dark:text-teal-50"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <aside
        className={cn(
          "sidebar",
          isExpanded ? "sidebar-expanded" : "sidebar-collapsed",
          isMobile && "fixed z-30",
          isMobile && (sidebarOpen ? "sidebar-open" : "sidebar-closed")
        )}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
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
                <span
                  className={cn(
                    "sidebar-label",
                    !isExpanded && !isMobile && "hidden" // Solo oculta si no está expandido Y no es móvil
                  )}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
        {/*area donde no se que poner xd */}

      </aside>

      {/* Overlay para móviles */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      {modalOpen && (
        <div className="sidebar-modal-overlay">
          <div className="sidebar-modal">
            <h3 className="sidebar-modal-title">¿Cerrar sesión?</h3>
            <p className="sidebar-modal-text">
              ¿Seguro que quieres cerrar sesión?
            </p>
            <div className="flex justify-around">
              <button
                onClick={handleLogout}
                className="sidebar-modal-button-yes"
              >
                Sí
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="sidebar-modal-button-no"
              >
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
