// src/components/FloatingNotification.tsx
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { getProfessionalNotifications, getClientNotifications, getAdminNotifications } from "../../api/notifications";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";

export type Notification = {
  id: string;
  type: "upcoming" | "completed" | "cancelled" | "feedback" | "CONFIRMED" ;
  message: string;
  date: string;
  context?: Record<string, unknown>;
};

export const FloatingNotification = () => {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      if (!user) return;

      let data: Notification[] = [];

      switch (user.role) {
        case "CLIENT":
          data = await getClientNotifications();
          break;

        case "PROFESSIONAL":
          data = await getProfessionalNotifications();
          break;

        case "ADMIN":
           data = await getAdminNotifications(); 
          break;

        default:
          console.warn(`Rol no reconocido: ${user.role}`);
          break;
      }

      console.log("info en data", data)
      setNotifications(data);
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000); // Actualizar cada 30 segundos

  return () => clearInterval(interval);
}, [user]);


  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setDeletingIds((prev) => [...prev, notificationId]);

      // 1. Optimistic UI update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      // 2. API call to delete
      //   await deleteNotification(notificationId);
    } catch (error) {
      console.error("Error al eliminar notificación:", error);
      // Revert if error
      const fetchData = await getProfessionalNotifications();
      setNotifications(fetchData);
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== notificationId));
    }
  };

  if (notifications.length === 0) return null;

  const notificationColors = {
    upcoming: "bg-blue-50 text-blue-800 border-l-4 border-blue-400",
    completed: "bg-green-50 text-green-800 border-l-4 border-green-400",
    cancelled: "bg-red-50 text-red-800 border-l-4 border-red-400",
    feedback: "bg-purple-50 text-purple-800 border-l-4 border-purple-400",
    CONFIRMED: "bg-teal-50 text-teal-800 border-l-4 border-teal-400",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors duration-200"
          aria-label="Notificaciones"
        >
          <BellIcon className="h-6 w-6 text-gray-600" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="w-80 max-h-96 overflow-y-auto rounded-lg bg-white shadow-xl ring-1 ring-black/5">
          <div className="p-3 font-medium text-gray-700 border-b border-gray-100 flex justify-between items-center">
            <span>Notificaciones ({notifications.length})</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Cerrar panel"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 pr-8 text-sm relative ${
                  notificationColors[notification.type] || "bg-gray-50"
                }`}
              >
            <div className="flex justify-between items-start">
  <p className="flex-1">{notification.message}</p>
  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
    {new Date(notification.date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </span>
</div>
                <button
                  onClick={() => handleDeleteNotification(notification.id)}
                  disabled={deletingIds.includes(notification.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Eliminar notificación"
                >
                  {deletingIds.includes(notification.id) ? (
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <XMarkIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingNotification;
