import { apiFetch } from "./base";

export interface Specialty {
  id: number;
  name: string;
  description: string;
}

export async function getAllSpecialties(): Promise<Specialty[]> {
  return apiFetch("/specialties");
}
