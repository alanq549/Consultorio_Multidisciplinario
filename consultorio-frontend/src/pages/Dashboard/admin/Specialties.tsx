import { useEffect, useState } from "react";
import { apiFetch } from "../../../api/base";
import { SpecialtyCard } from "../../../components/ui/SpecialtyCard";
import { SpecialtyForm } from "../../../components/forms/SpecialtyForm";
import "../../../styles/form/specialtyComponents.css";
import { AddSpecialtyCard } from "../../../components/ui/AddSpecialtyCard";

interface Specialty {
  id: number;
  name: string;
  description: string;
}

const Specialties = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchSpecialties = async () => {
    try {
      const data = await apiFetch<Specialty[]>("/specialties");
      setSpecialties(data);
    } catch (err) {
      setError("Error al cargar las especialidades");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchSpecialties();
}, []);


  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar esta especialidad? Esta acción no se puede deshacer.")) {
      try {
        await apiFetch(`/specialties/${id}`, { method: "DELETE" });
        setSpecialties(prev => prev.filter(s => s.id !== id));
      } catch (error) {
        alert("No se pudo eliminar la especialidad: " + (error as Error).message);
      }
    }
  };

  const handleFormSubmit = async (data: { name: string; description: string }) => {
    try {
      if (editingSpecialty) {
        const updated = await apiFetch<Specialty>(`/specialties/${editingSpecialty.id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        });
        setSpecialties(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      } else {
        const created = await apiFetch<Specialty>("/specialties", {
          method: "POST",
          body: JSON.stringify(data),
        });
        setSpecialties(prev => [...prev, created]);
      }

      setFormOpen(false);
      setEditingSpecialty(null);
    } catch (error) {
      alert("Error al guardar: " + (error as Error).message);
    }
  };

  if (isLoading) {
    return (
      <div className="specialties-page">
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-12 w-12 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="specialties-page">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

return (
  <div className="specialties-page">
    <div className="specialties-header">
      <div>
        <h1 className="specialties-title">Gestión de Especialidades Médicas</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Administre las especialidades disponibles en el sistema
        </p>
      </div>
    </div>

    {isLoading ? (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    ) : error ? (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    ) : specialties.length === 0 ? (
      <div className="specialties-empty">
        <div className="bg-teal-50 dark:bg-teal-900/20 rounded-full p-4 mb-4">
          <svg className="w-10 h-10 text-teal-600 dark:text-teal-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
          No hay especialidades registradas
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md text-center">
          Comience agregando las especialidades médicas disponibles en su consultorio
        </p>
        
        <AddSpecialtyCard onClick={() => setFormOpen(true)} />
      </div>
    ) : (
      <div className="specialties-grid">
        {specialties.map(spec => (
          <SpecialtyCard
            key={spec.id}
            name={spec.name}
            description={spec.description}
            onDelete={() => handleDelete(spec.id)}
            onEdit={() => {
              setEditingSpecialty(spec);
              setFormOpen(true);
            }}
          />
        ))}
        <AddSpecialtyCard onClick={() => {
          setEditingSpecialty(null);
          setFormOpen(true);
        }} />
      </div>
    )}

    <SpecialtyForm
      isOpen={formOpen}
      onClose={() => {
        setFormOpen(false);
        setEditingSpecialty(null);
      }}
      onSubmit={handleFormSubmit}
      defaultValues={editingSpecialty || undefined}
    />
  </div>
);
};

export default Specialties;