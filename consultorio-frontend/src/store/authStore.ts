import { create } from "zustand";

interface Specialty {
  name: string;
}

interface ProfessionalProfile {
  specialty: Specialty;
  description: string;
  certificates: string[];
  isVerified: boolean;
  photoUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
  };
}

type Role = "ADMIN" | "PROFESSIONAL" | "CLIENT";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  photoUrl?: string;
  professionalProfile?: ProfessionalProfile;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
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
}));
