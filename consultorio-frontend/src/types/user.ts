export interface Specialty {
  id?: number;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface ProfessionalProfile {
  id?: number;
  userId?: number;
  specialtyId?: number;
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
  user?: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export type Role = "ADMIN" | "PROFESSIONAL" | "CLIENT";

export interface User {
  id: number;
  name: string;
  lastName?: string;
  email: string;
  role: Role;
  phone?: string;      // <--- acá lo agregás
  photoUrl?: string;
  avatar?: string;
  professionalProfile?: ProfessionalProfile;
}
