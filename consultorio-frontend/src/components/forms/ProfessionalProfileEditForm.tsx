import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { Specialty } from "../../api/specialties";
import { useAuthStore } from "../../store/authStore";
import { FaFacebook, FaInstagram, FaGlobe } from "react-icons/fa";
import "../../styles/form/professionalProfile.css";


pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

interface EditFormProps {
  form: {
    specialtyId: string;
    description: string;
    certificates: string[]; // URLs de certificados ya guardados
    photoUrl: string;
    socialLinks: {
      facebook: string;
      instagram: string;
      website: string;
    };
  };
  specialties: Specialty[];
  onFileChange?: (field: "photo" | "certificates", files: File | File[]) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

const ProfessionalProfileEditForm: React.FC<EditFormProps> = ({
  form,
  specialties,
  onChange,
  onFileChange,
  onCancel,
  onSubmit,
  isSubmitting = false,
}) => {
  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";

  // Estado para miniaturas PDF ya cargados (URLs)
  const [pdfThumbnails, setPdfThumbnails] = useState<{ [key: number]: string | null }>({});

  // Estado para nuevos archivos subidos y sus miniaturas
  const [newCertFiles, setNewCertFiles] = useState<File[]>([]);
  const [newCertThumbnails, setNewCertThumbnails] = useState<(string | null)[]>([]);

  // Genera miniatura PDF desde URL
  const generatePDFThumbnailFromUrl = async (url: string): Promise<string | null> => {
    try {
      const pdf = await pdfjsLib.getDocument(url).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) {
      console.error("Error generando miniatura PDF desde URL:", error);
      return null;
    }
  };

  // Genera miniatura PDF desde archivo local
  const generatePDFThumbnailFromFile = async (file: File): Promise<string | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      return canvas.toDataURL();
    } catch (error) {
      console.error("Error generando miniatura PDF desde archivo:", error);
      return null;
    }
  };

  // Generar miniaturas para PDFs ya cargados (URLs)
useEffect(() => {
  form.certificates.forEach((certUrl, index) => {
    const extension = certUrl.split(".").pop()?.toLowerCase();
    if (extension === "pdf" && !pdfThumbnails[index]) {
      // Si certUrl ya incluye "uploads/certificates", solo pon STATIC_URL delante
      const url = `${STATIC_URL}${certUrl}`;
      console.log(`Generando miniatura para PDF #${index} con URL:`, url);

      generatePDFThumbnailFromUrl(url).then((thumbnail) => {
        setPdfThumbnails((prev) => ({ ...prev, [index]: thumbnail }));
      });
    }
  });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [form.certificates]);

  // Generar miniaturas para nuevos archivos subidos
  useEffect(() => {
    const generateThumbnails = async () => {
      const thumbs: (string | null)[] = await Promise.all(
        newCertFiles.map(async (file) => {
          const ext = file.name.split(".").pop()?.toLowerCase();
          if (ext === "pdf") {
            return await generatePDFThumbnailFromFile(file);
          } else if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
            return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (ev) => resolve(ev.target?.result as string);
              reader.readAsDataURL(file);
            });
          } else {
            return null;
          }
        })
      );
      setNewCertThumbnails(thumbs);
    };

    if (newCertFiles.length > 0) {
      generateThumbnails();
    }
  }, [newCertFiles]);

  // Maneja la subida de nuevos certificados
  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);

      setNewCertFiles(filesArray);

      // Llamamos onFileChange para que el componente padre maneje el upload
      onFileChange?.("certificates", filesArray);
    }
  };

  // Manejo foto perfil
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange?.("photo", e.target.files[0]);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            target: {
              name: "photoUrl",
              value: event.target.result as string,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const { user } = useAuthStore();
  if (!user) return null;

  let userImage: string | null = null;
  if (user.role === "PROFESSIONAL" && user.professionalProfile?.photoUrl) {
    userImage = `${STATIC_URL}${user.professionalProfile.photoUrl}`;
  } else if (user.avatar) {
    userImage = user.avatar;
  }

  return (
    <form onSubmit={onSubmit} className="profile-edit-form">
      <div className="form-header">
        <h2 className="form-title">Editar Perfil Profesional</h2>
      </div>

      {/* Foto de perfil */}
      <div className="form-group">
        <div className="avatar-edit-container">
          <img
            src={userImage || form.photoUrl || "/user/default-avatar.png"}
            alt="Foto de perfil"
            className="avatar-edit-image"
          />
          <label className="avatar-edit-button">
            <svg className="edit-icon" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Cambiar 
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Especialidad */}
      <div className="form-group">
        <label htmlFor="specialtyId" className="form-label">
          Especialidad
        </label>
        <select
          id="specialtyId"
          name="specialtyId"
          value={form.specialtyId}
          onChange={onChange}
          required
          className="form-select"
        >
          <option value="">Selecciona tu especialidad</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Descripción */}
      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Descripción Profesional
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Describe tu experiencia, formación y enfoque profesional..."
          className="form-textarea"
          rows={6}
        />
      </div>

      {/* Certificados */}
      <div className="form-group">
        <label className="form-label">Certificados</label>

        <p>Por favor de sumirlos como imagen</p>

        {/* Certificados ya guardados (URLs) */}
        {form.certificates.length > 0 && (
          <div className="certificates-grid">
            {form.certificates.map((certUrl, index) => {
              const extension = certUrl.split(".").pop()?.toLowerCase();
              const isImage = ["jpg", "jpeg", "png", "gif"].includes(extension || "");
              const isPDF = extension === "pdf";

              return (
                <div key={`old-${index}`} className="certificate-card">
                  <div className="certificate-preview">
                    {isImage ? (
                      <img
                        src={`${STATIC_URL}${certUrl}`}
                        alt={`Certificado ${index + 1}`}
                        className="certificate-image"
                      />
                    ) : isPDF ? (
                      pdfThumbnails[index] ? (
                        <img
                          src={pdfThumbnails[index]!}
                          alt={`Miniatura del PDF ${index + 1}`}
                          className="certificate-image"
                        />
                      ) : (
                        <div className="pdf-loading">Generando vista previa...</div>
                      )
                    ) : (
                      <div className="file-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="certificate-actions">
                    <a
                      href={`${STATIC_URL}${certUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-link"
                    >
                      Ver
                    </a>
                    <button
                      type="button"
                      className="delete-link"
                      onClick={() => {
                        const updatedCertificates = [...form.certificates];
                        updatedCertificates.splice(index, 1);
                        onChange({
                          target: {
                            name: "certificates",
                            value: updatedCertificates,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>);
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nuevos archivos subidos */}
        {newCertFiles.length > 0 && (
          <div className="certificates-grid">
            {newCertFiles.map((file, index) => {
              const ext = file.name.split(".").pop()?.toLowerCase();
              const thumbnail = newCertThumbnails[index];

              return (
                <div key={`new-${index}`} className="certificate-card">
                  <div className="certificate-preview">
                    {ext === "pdf" ? (
                      thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Miniatura PDF nuevo ${index + 1}`}
                          className="certificate-image"
                        />
                      ) : (
                        <div className="pdf-loading">Generando vista previa...</div>
                      )
                    ) : (
                      thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Imagen nueva ${index + 1}`}
                          className="certificate-image"
                        />
                      ) : (
                        <div>Cargando imagen...</div>
                      )
                    )}
                  </div>
                  <div className="certificate-actions">
                    {/* Podrías agregar botón para eliminar el archivo local si quieres */}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <label className="file-upload-label">
          <svg className="upload-icon" viewBox="0 0 24 24">
            <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Subir nuevos certificados</span>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleCertificateChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Redes Sociales */}
      <div className="form-group">
        <label className="form-label">Redes Sociales</label>

        <div className="social-input-group">
          <div className="social-input-container">
            <FaFacebook className="social-icon" />
            <input
              name="facebook"
              value={form.socialLinks.facebook}
              onChange={onChange}
              placeholder="https://facebook.com/tu-perfil"
              className="social-input"
              type="url"
            />
          </div>

          <div className="social-input-container">
            <FaInstagram className="social-icon" />
            <input
              name="instagram"
              value={form.socialLinks.instagram}
              onChange={onChange}
              placeholder="https://instagram.com/tu-perfil"
              className="social-input"
              type="url"
            />
          </div>

          <div className="social-input-container">
            <FaGlobe className="social-icon" />
            <input
              name="website"
              value={form.socialLinks.website}
              onChange={onChange}
              placeholder="https://tu-sitio-web.com"
              className="social-input"
              type="url"
            />
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? (
            <>
              <svg className="spinner" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
              Guardando...
            </>
          ) : (
            "Guardar Cambios"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfessionalProfileEditForm;
