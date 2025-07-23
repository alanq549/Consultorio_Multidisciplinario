import { useEffect, useState } from "react";
import { getAllSpecialties, type Specialty } from "../api/specialties";
import { getAllProfessionalProfiles } from "../api/professionals";
import { getAllServices, type Service } from "../api/services";
import { getAvailability } from "../api/appointments";
import type { ProfessionalProfile } from "../types/user";

export interface StepState {
  specialty?: Specialty;
  professional?: ProfessionalProfile;
  service?: Service;
  date?: string;
  time?: string;
}

export const useBookingData = () => {
  const [step, setStep] = useState<StepState>({});
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<ProfessionalProfile[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specs, profs, servs] = await Promise.all([
          getAllSpecialties(),
          getAllProfessionalProfiles(),
          getAllServices(),
        ]);
        setSpecialties(specs);
        setProfessionals(profs);
        setServices(servs);
      } catch {
        setError("Error al cargar datos iniciales");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (step.specialty) {
      const filtered = professionals.filter(p => p.specialty.id === step.specialty?.id);
      setFilteredProfessionals(filtered);
      setStep(prev => ({ ...prev, professional: undefined, service: undefined }));
    }
  }, [step.specialty, professionals]);

  useEffect(() => {
    if (step.professional) {
      const filtered = services.filter(s => s.isActive && s.professionalId === step.professional?.id);
      setFilteredServices(filtered);
      setStep(prev => ({ ...prev, service: undefined }));
    }
  }, [step.professional, services]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (step.professional && step.date) {
        try {
          const res = await getAvailability(step.professional.id!, step.date);
          setAvailableTimes(res.availableTimes);
        } catch {
          setError("Error al obtener disponibilidad");
        }
      }
    };
    fetchAvailability();
  }, [step.professional, step.date]);

  return {
    step, setStep,
    specialties,
    professionals,
    services,
    filteredProfessionals,
    filteredServices,
    availableTimes,
    error,
  };
};
