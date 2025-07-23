import { useEffect, useState } from "react";
import { createProfessionalProfile } from "../../api/professionals";
import { getAllSpecialties } from "../../api/specialties";
import type { Specialty } from "../../api/specialties";
import { useNavigate } from "react-router-dom";
import "../../styles/form/CreateProfileForm.css";
import { useAuthStore } from "../../store/authStore";

export default function ProfessionalProfileForm() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [form, setForm] = useState({
    specialtyId: "",
    description: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    facebook: "",
    instagram: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSpecialties().then(setSpecialties).catch(console.error);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSocialLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialLinks((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveCertificate = (index: number) => {
    setCertificateFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("specialtyId", form.specialtyId);
      formData.append("description", form.description);
      formData.append("socialLinks", JSON.stringify(socialLinks));

      if (photoFile) formData.append("photo", photoFile);
      certificateFiles.forEach((file) => formData.append("certificates", file));

      const profile = await createProfessionalProfile(formData);

      // Actualiza el usuario en el store con la info del perfil profesional
      useAuthStore.getState().updateUser({
        professionalProfile: {
          specialty: { name: profile.specialty?.name ?? "Especialidad" },
          description: profile.description,
          certificates: profile.certificates ?? [],
          isVerified: profile.isVerified,
          photoUrl: profile.photoUrl, // Aquí es clave poner la URL del backend
          socialLinks: profile.socialLinks,
        },
      });
      navigate("/dashboard/professional");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <form onSubmit={handleSubmit} className="cp-form-container">
    {/* Photo Upload */}
    <div className="cp-form-group flex flex-col items-center">
      <label className="cp-form-label">
        Foto de Perfil
      </label>

      <label
        htmlFor="photo"
        className="cp-form-photo-container"
        style={{ width: 128, height: 128 }}
        title="Haz clic para cambiar la foto"
      >
        <img
          src={
            photoFile
              ? URL.createObjectURL(photoFile)
              : "/user/default-avatar.png"
          }
          alt="Foto de perfil"
          className="w-32 h-32 object-cover rounded-full"
        />
        <div className="cp-form-photo-overlay">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536M9 11l6 6L7 21l-4-4 6-6z"
            />
          </svg>
        </div>
      </label>

      <input
        id="photo"
        type="file"
        accept="image/*"
        onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
        className="hidden"
      />
    </div>

    {/* Specialty Selection */}
    <div className="cp-form-group">
      <label htmlFor="specialtyId" className="cp-form-label">
        Especialidad Médica
      </label>
      <select
        id="specialtyId"
        name="specialtyId"
        value={form.specialtyId}
        onChange={handleChange}
        required
        className="cp-form-select"
      >
        <option value="">Selecciona tu especialidad</option>
        {specialties.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>

    {/* Description */}
    <div className="cp-form-group">
      <label htmlFor="description" className="cp-form-label">
        Descripción Profesional
      </label>
      <textarea
        id="description"
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Describe tu experiencia, formación y enfoque profesional..."
        required
        className="cp-form-textarea"
      />
    </div>

    {/* Certificates Upload */}
    <div className="cp-form-group">
      <label htmlFor="certificates" className="cp-form-label">
        Certificados (PDF o imágenes)
      </label>
      <input
        id="certificates"
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        multiple
        onChange={(e) =>
          setCertificateFiles(Array.from(e.target.files || []))
        }
        className="cp-form-file-input"
      />
      {certificateFiles.length > 0 && (
        <div className="w-full flex justify-center">
          <div className="cp-form-certificates-container">
            {certificateFiles.map((file, index) => {
              const isImage = file.type.startsWith("image/");
              const fileUrl = URL.createObjectURL(file);

              return (
                <div
                  key={index}
                  className="cp-form-certificate-card"
                >
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={`Certificado ${index + 1}`}
                      className="w-full h-40 object-cover rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-40 bg-gray-100 text-red-600 font-semibold text-sm rounded">
                      <svg
                        className="w-8 h-8 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0013.172 2H6zm6 1.5L18.5 10H13a1 1 0 01-1-1V3.5z" />
                      </svg>
                      {file.name}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(index)}
                    className="cp-form-remove-certificate-btn"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

    {/* Social Links */}
    <div className="cp-form-group">
      <label className="cp-form-label">Redes Sociales</label>
      <div className="cp-form-social-links-container">
        <div>
          <input
            type="url"
            name="facebook"
            value={socialLinks.facebook}
            onChange={handleSocialLinkChange}
            placeholder="Facebook (opcional)"
            className="cp-form-input"
          />
        </div>
        <div>
          <input
            type="url"
            name="instagram"
            value={socialLinks.instagram}
            onChange={handleSocialLinkChange}
            placeholder="Instagram (opcional)"
            className="cp-form-input"
          />
        </div>
        <div>
          <input
            type="url"
            name="website"
            value={socialLinks.website}
            onChange={handleSocialLinkChange}
            placeholder="Sitio web personal (opcional)"
            className="cp-form-input"
          />
        </div>
      </div>
      <p className="cp-form-social-links-note">
        Estos enlaces aparecerán en tu perfil público
      </p>
    </div>

    <button type="submit" disabled={isSubmitting} className="cp-form-submit-btn">
      {isSubmitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="cp-form-spinner"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Guardando...
        </span>
      ) : (
        "Guardar Perfil Profesional"
      )}
    </button>
  </form>
);
}
