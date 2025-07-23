import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfessionalProfileById } from "../../api/professionals";
import type { ProfessionalProfile } from "../../types/user";
import { usePdfThumbnails } from "../../hooks/usePdfThumbnails";
import "../../styles/ui/ProfessionalProfilePage.css";

const ProfessionalProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de profesional no proporcionado");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfessionalProfileById(Number(id));
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar perfil profesional:", err);
        setError("Error al cargar perfil profesional");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const certificates = profile?.certificates || [];
  const thumbnails = usePdfThumbnails(
    certificates.map(cert => `${import.meta.env.VITE_BACKEND_STATIC_URL}${cert}`)
  );

  if (loading) return (
    <div className="professional-profile_loading">
      <div className="professional-profile_spinner"></div>
      <p>Cargando perfil profesional...</p>
    </div>
  );

  if (error) return (
    <div className="professional-profile_error">
      <svg className="professional-profile_error-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p>{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="professional-profile_retry-button"
      >
        Reintentar
      </button>
    </div>
  );

  if (!profile) return (
    <div className="professional-profile_empty">
      <svg className="professional-profile_empty-icon" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <h3>No se encontró el perfil profesional</h3>
      <p>El perfil solicitado no está disponible</p>
    </div>
  );

  return (
    <div className="professional-profile_container">
      <div className="professional-profile_header">
        <div className="professional-profile_avatar-container">
          {profile.photoUrl ? (
            <img
              src={`${import.meta.env.VITE_BACKEND_STATIC_URL}${profile.photoUrl}`}
              alt={`Foto de ${profile.user?.name}`}
              className="professional-profile_avatar"
            />
          ) : (
            <div className="professional-profile_avatar-placeholder">
              {profile.user?.name?.charAt(0)}{profile.user?.lastName?.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="professional-profile_info">
<h1 className="professional-profile_name">
  {profile.user?.name} {profile.user?.lastName}
<h1 className="professional-profile_name">
  {profile.isVerified ? (
    <span
      title="Profesional verificado"
      style={{
        marginLeft: 8,
        color: "#4caf50",
        fontWeight: "bold",
        display: "inline-flex",
        alignItems: "center",
        fontSize: 16,
      }}
    >
     verificado
    </span>
  ) : (
    <span
      title="Profesional no verificado"
      style={{
        marginLeft: 8,
        color: "#f44336", // rojo
        fontWeight: "bold",
        display: "inline-flex",
        alignItems: "center",
        fontSize: 16,
      }}
    >
      no verficicado
    </span>
  )}
</h1>

</h1>
          <p className="professional-profile_specialty">
            {profile.specialty?.name || "Profesional de la salud"}
          </p>
          
          {profile.socialLinks && (
            <div className="professional-profile_social-links">
              {profile.socialLinks.facebook && (
                <a 
                  href={profile.socialLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="professional-profile_social-link"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                  </svg>
                </a>
              )}
              {profile.socialLinks.instagram && (
                <a 
                  href={profile.socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="professional-profile_social-link"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              )}
              {profile.socialLinks.website && (
                <a 
                  href={profile.socialLinks.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="professional-profile_social-link"
                  aria-label="Sitio web"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="professional-profile_content">
        <section className="professional-profile_section">
          <h2 className="professional-profile_section-title">Sobre mí</h2>
          <p className="professional-profile_description">
            {profile.description || "Este profesional no ha agregado una descripción todavía."}
          </p>
        </section>

        {certificates.length > 0 && (
          <section className="professional-profile_section">
            <h2 className="professional-profile_section-title">Certificaciones</h2>
            <div className="professional-profile_certificates">
              {certificates.map((cert, idx) => {
                const fullUrl = `${import.meta.env.VITE_BACKEND_STATIC_URL}${cert}`;
                const thumb = thumbnails[idx];

                return (
                  <div key={idx} className="professional-profile_certificate">
                    {thumb ? (
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="professional-profile_certificate-link">
                        <img
                          src={thumb}
                          alt={`Certificado ${idx + 1}`}
                          className="professional-profile_certificate-thumbnail"
                        />
                        <span className="professional-profile_certificate-label">Certificado {idx + 1}</span>
                      </a>
                    ) : (
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="professional-profile_certificate-link">
                        <div className="professional-profile_certificate-placeholder">
                          <svg viewBox="0 0 24 24">
                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                          </svg>
                        </div>
                        <span className="professional-profile_certificate-label">Ver certificado {idx + 1}</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProfessionalProfilePage;