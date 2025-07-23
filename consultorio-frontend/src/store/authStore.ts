import { create } from "zustand";
import type { User } from "../types/user"; // 👈



interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  updateUser: (newData: Partial<User>) => void; // 👈 NUEVA
}


export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  login: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  isAuthenticated: () => !!localStorage.getItem("token"),
updateUser: (newData) =>
  set((state) => {
    if (!state.user) return state;

    const incomingProfile = newData.professionalProfile;

    const updatedUser: User = {
      ...state.user,
      ...newData,
      ...(incomingProfile && {
        professionalProfile: {
          ...state.user.professionalProfile,
          ...incomingProfile,
          specialty:
            incomingProfile.specialty ??
            state.user.professionalProfile?.specialty ??
            { name: "Especialidad no definida" },
          description:
            incomingProfile.description ??
            state.user.professionalProfile?.description ??
            "",
          certificates:
            incomingProfile.certificates ??
            state.user.professionalProfile?.certificates ??
            [],
          isVerified:
            incomingProfile.isVerified ??
            state.user.professionalProfile?.isVerified ??
            false,
          photoUrl:
            incomingProfile.photoUrl ??
            state.user.professionalProfile?.photoUrl,
          socialLinks:
            incomingProfile.socialLinks ??
            state.user.professionalProfile?.socialLinks,
        },
      }),
    };
console.log("Guardando en localStorage:", updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    return { user: updatedUser };
  }),




}));
