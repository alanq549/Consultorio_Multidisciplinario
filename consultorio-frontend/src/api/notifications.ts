// src/api/notifications.ts
import { apiFetch } from "./base"; // ya tienes esta util
import type { Notification } from "../components/ui/FloatingNotification";



export const getClientNotifications = () => {
  return apiFetch<Notification[]>("/notifications/client");
};

export const getProfessionalNotifications = () => {
  return apiFetch<Notification[]>("/notifications/professional");
};



export const getAdminNotifications = () => {
  return apiFetch<Notification[]>("/notifications/admin");
};
