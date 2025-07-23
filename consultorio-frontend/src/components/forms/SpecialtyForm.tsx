import { useState, useEffect } from "react";
import "../../styles/form/specialtyComponents.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  defaultValues?: { name: string; description: string };
}

export const SpecialtyForm = ({ isOpen, onClose, onSubmit, defaultValues }: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      setName(defaultValues.name);
      setDescription(defaultValues.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [defaultValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="specialty-modal-overlay">
      <div className={`specialty-modal ${isOpen ? "specialty-modal-open" : ""}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-teal-600 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="specialty-modal-title">
          {defaultValues ? "Editar Especialidad" : "Nueva Especialidad Médica"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Nombre</label>
            <input
              id="name"
              type="text"
              placeholder="Ej: Cardiología"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="specialty-input"
            />
          </div>

          <div>
            <label htmlFor="description" className="sr-only">Descripción</label>
            <textarea
              id="description"
              placeholder="Descripción de la especialidad..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="specialty-textarea"
            />
          </div>

          <div className="specialty-form-actions">
            <button 
              type="button" 
              onClick={onClose} 
              className="specialty-cancel-btn"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="specialty-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : defaultValues ? (
                "Guardar Cambios"
              ) : (
                "Crear Especialidad"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};