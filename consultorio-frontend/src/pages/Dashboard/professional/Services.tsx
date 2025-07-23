import { useEffect, useState } from "react";
import {
  getMyServices,
  deleteService,
  type Service,
} from "../../../api/services";
import ServiceForm from "../../../components/forms/ServiceForm";
import "../../../styles/professional/ServicesList.css";
import { useModal } from "../../../components/context/useModal"; // Ajustá la ruta si es necesario


const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchServices = async () => {
    try {
      setLoading(true);

      const data = await getMyServices(); // ✅ se usa directamente

      setServices(data.filter((s) => s.isActive));
    } catch (err) {
      console.error("Error cargando servicios desde getMyServices:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowFormModal(true);
  };

  const { showModal } = useModal(); 
const handleDelete = (id: number) => {
  showModal({
    title: "Confirmar eliminación",
    message: "¿Seguro que deseas eliminar este servicio?",
    confirmText: "Sí, eliminar",
    cancelText: "No",
    onConfirm: async () => {
      try {
        setDeletingId(id);
        await deleteService(id);
        await fetchServices();
      } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el servicio.");
      } finally {
        setDeletingId(null);
      }
    },
    onCancel: () => {
      // Opcional: puedes poner un console.log o nada
    },
  });
};


  useEffect(() => {
    fetchServices();
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

return (
  <div className="services-container">
    <div className="services-header">
      <div>
        <h1 className="services-title">Mis Servicios</h1>
        <p className="services-subtitle">
          Administra y organiza los servicios que ofreces a tus pacientes de manera sencilla
        </p>
      </div>
      <button
        onClick={() => {
          setEditingService(null);
          setShowFormModal(true);
        }}
        className="create-service-button"
      >
        <svg className="plus-icon" viewBox="0 0 24 24">
          <path d="M12 4v16m8-8H4" />
        </svg>
        Nuevo servicio
      </button>
    </div>

    {showFormModal && (
      <div className={`modal-overlay ${showFormModal ? 'visible' : ''}`}>
        <div className="modal-container">
          <ServiceForm
            onSuccess={() => {
              setEditingService(null);
              setShowFormModal(false);
              fetchServices();
            }}
            editingService={editingService}
            onClose={() => setShowFormModal(false)}
          />
        </div>
      </div>
    )}

    <section className="services-section">
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar servicios por nombre o descripción..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando tus servicios...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-state">
          <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9.172 16.242L12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828zM12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="M12 8v4" strokeWidth="2" />
            <path d="M12 16h.01" strokeWidth="2" />
          </svg>
          <h3>
            {searchTerm
              ? "No encontramos coincidencias"
              : "Aún no tienes servicios"}
          </h3>
          <p>
            {searchTerm
              ? "Prueba con diferentes palabras clave"
              : "Comienza creando tu primer servicio para ofrecer a tus pacientes"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowFormModal(true)}
              className="create-service-button empty-button"
            >
              <svg className="plus-icon" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Crear mi primer servicio
            </button>
          )}
        </div>
      ) : (
        <div className="services-list">
          {filteredServices.map((service) => (
            <div key={service.id} className="service-item">
              <div className="service-content">
                <h3 className="service-name">{service.name}</h3>
                {service.description && (
                  <p className="service-description">{service.description}</p>
                )}
                <div className="service-meta">
                  <span className="service-duration">
                    <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path d="M12 6v6l4 2" strokeWidth="1.5" />
                    </svg>
                    {formatDuration(service.durationMinutes)}
                  </span>
                  <span className="service-price">
                    <svg className="dollar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2v20m5-17H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="1.5" />
                    </svg>
                    ${service.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="service-actions">
                <button
                  onClick={() => handleEdit(service)}
                  className="edit-button"
                  disabled={deletingId === service.id}
                >
                  <svg className="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="1.5" />
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="1.5" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="delete-button"
                  disabled={deletingId === service.id}
                >
                  {deletingId === service.id ? (
                    <>
                      <svg className="spinner-icon" viewBox="0 0 24 24">
                        <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <svg className="delete-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="1.5" />
                      </svg>
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);
};

export default Services;
