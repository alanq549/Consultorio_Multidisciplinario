import { useEffect, useState } from "react";
import {
  getMyProfessionalProfile,
  updateProfessionalProfile,
} from "../../../api/professionals";
import { getAllSpecialties } from "../../../api/specialties";
import type { ProfessionalProfile } from "../../../types/user";
import type { Specialty } from "../../../api/specialties";
import { useAuthStore } from "../../../store/authStore";
import "../../../styles/professional/professionalProfile.css";
import ProfessionalProfileEditForm from "../../../components/forms/ProfessionalProfileEditForm";
import { FaFacebook, FaInstagram, FaGlobe } from "react-icons/fa";
import * as pdfjsLib from "pdfjs-dist";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
import { usePdfThumbnails } from "../../../hooks/usePdfThumbnails";
import type { ReviewClient } from "../../../api/reviews"; // define este tipo o crea uno similar
import {
  getProfessionalReviews,
  getProfessionalRating,
} from "../../../api/reviews";

const Profile = () => {
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [certificateFiles, setCertificateFiles] = useState<File[]>([]);
  const [editing, setEditing] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [form, setForm] = useState({
    photoUrl: "",
    specialtyId: "",
    description: "",
    certificates: [] as string[],
    socialLinks: {
      facebook: "",
      instagram: "",
      website: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  //resenas:
  const [reviews, setReviews] = useState<ReviewClient[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);

  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";

  // Definimos las URLs completas para los certificados
  const certUrls = profile?.certificates
    ? profile.certificates.map((cert) => `${STATIC_URL}${cert}`)
    : [];

  // Usamos el hook para obtener las miniaturas
  const pdfThumbnails = usePdfThumbnails(certUrls);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, specialtiesData] = await Promise.all([
          getMyProfessionalProfile(),
          getAllSpecialties(),
        ]);

        setProfile(profileData);
        setSpecialties(specialtiesData);

        const parsedLinks =
          typeof profileData.socialLinks === "string"
            ? JSON.parse(profileData.socialLinks)
            : profileData.socialLinks ?? {
                facebook: "",
                instagram: "",
                website: "",
              };
        setForm({
          specialtyId: String(profileData.specialtyId),
          description: profileData.description,
          certificates: profileData.certificates || [],
          photoUrl: profileData.photoUrl || "",
          socialLinks: parsedLinks,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      if (user?.role === "PROFESSIONAL" && user.professionalProfile?.id) {
        try {
          const [reviewsData, ratingData] = await Promise.all([
            getProfessionalReviews(user.professionalProfile.id),
            getProfessionalRating(user.professionalProfile.id),
          ]);
          setReviews(reviewsData);
          setAverageRating(ratingData.average);
        } catch (err) {
          console.error("Error fetching reviews", err);
        }
      }
    };
    fetchReviews();
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name in form.socialLinks) {
      setForm((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("specialtyId", form.specialtyId);
    formData.append("description", form.description);

    // Enviar siempre las 3 propiedades, aunque estén vacías
    const safeSocialLinks = {
      facebook: form.socialLinks.facebook || "",
      instagram: form.socialLinks.instagram || "",
      website: form.socialLinks.website || "",
    };
    formData.append("socialLinks", JSON.stringify(safeSocialLinks));

    if (photoFile) formData.append("photo", photoFile);

    certificateFiles.forEach((file) => formData.append("certificates", file));

    form.certificates.forEach((cert) =>
      formData.append("existingCertificates", cert)
    );
    await updateProfessionalProfile(formData);

    const updated = await getMyProfessionalProfile();
    setProfile(updated);
    setForm({
      photoUrl: updated.photoUrl || "",
      specialtyId: String(updated.specialtyId),
      description: updated.description,
      certificates: updated.certificates || [],
      socialLinks:
        typeof updated.socialLinks === "string"
          ? (() => {
              try {
                const parsed = JSON.parse(updated.socialLinks);
                return {
                  facebook: parsed.facebook || "",
                  instagram: parsed.instagram || "",
                  website: parsed.website || "",
                };
              } catch {
                return { facebook: "", instagram: "", website: "" };
              }
            })()
          : {
              facebook: updated.socialLinks?.facebook || "",
              instagram: updated.socialLinks?.instagram || "",
              website: updated.socialLinks?.website || "",
            },
    });

    useAuthStore.getState().updateUser({
      professionalProfile: {
        specialty: updated.specialty ?? { name: "Especialidad" },
        description: updated.description,
        certificates: updated.certificates ?? [],
        isVerified: updated.isVerified,
        photoUrl: updated.photoUrl || "",
        socialLinks:
          typeof updated.socialLinks === "string"
            ? (() => {
                try {
                  const parsed = JSON.parse(updated.socialLinks);
                  return {
                    facebook: parsed.facebook || "",
                    instagram: parsed.instagram || "",
                    website: parsed.website || "",
                  };
                } catch {
                  return { facebook: "", instagram: "", website: "" };
                }
              })()
            : {
                facebook: updated.socialLinks?.facebook || "",
                instagram: updated.socialLinks?.instagram || "",
                website: updated.socialLinks?.website || "",
              },
      },
    });

    setPhotoFile(null);
    setCertificateFiles([]);
    setEditing(false);
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error al actualizar el perfil");
  }
};



  const handleFileChange = (
    field: "photo" | "certificates",
    files: File | File[]
  ) => {
    if (field === "photo" && files instanceof File) {
      setPhotoFile(files);
    } else if (field === "certificates") {
      if (Array.isArray(files)) {
        setCertificateFiles(files);
      } else {
        setCertificateFiles([files as File]);
      }
    }
  };

  if (!user) return null;

  let userImage: string | null = null;
  if (user.role === "PROFESSIONAL" && user.professionalProfile?.photoUrl) {
    userImage = `${STATIC_URL}${user.professionalProfile.photoUrl}`;
  } else if (user.avatar) {
    userImage = user.avatar;
  }

  if (isLoading) {
    return (
      <div className="profile-loading-container">
        <div className="profile-loading-spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error-container">
        No se pudo cargar el perfil profesional.
      </div>
    );
  }
  return (
    <div className="profile-layout">
      {!editing ? (
        <div className="profile-card">
          {/* Header section */}
          <div className="profile-header">
            <div className="profile-avatar-container">
              <img
                src={userImage || "/user/default-avatar.png"}
                alt="Foto de perfil"
                className="profile-avatar-image"
              />
            </div>
            <div className="profile-info-container">
              <div className="profile-name-verified">
                <h1 className="profile-user-name">
                  {profile.user?.name} {profile.user?.lastName}
                </h1>
                {profile.isVerified && (
                  <div className="profile-verification-badge">
                    <svg className="verified-icon" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verificado
                  </div>
                )}
              </div>
              <p className="profile-user-specialty">
                {profile.specialty?.name || "Sin especialidad definida"}
              </p>

              <p className="profile-user-email">
                <svg className="email-icon" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {profile.user?.email}
              </p>

              <div className="profile-social-linksp">
                {form.socialLinks.website && (
                  <a
                    href={form.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-linkp"
                  >
                    <FaGlobe className="social-icon" />
                    <span>Sitio web</span>
                  </a>
                )}

                {form.socialLinks.facebook && (
                  <a
                    href={form.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-linkp"
                  >
                    <FaFacebook className="social-icon" />
                    <span>Facebook</span>
                  </a>
                )}

                {form.socialLinks.instagram && (
                  <a
                    href={form.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon-linkp"
                  >
                    <FaInstagram className="social-icon" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>

              <div>
                <h1>Puntuación</h1>
                <p>⭐ {averageRating.toFixed(1)} / 5</p>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="profile-edit-buttonp"
            >
              <svg className="edit-icon" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Editar perfil
            </button>
          </div>

          {/* About section */}
          <div className="profile-content-section">
            <h2 className="profile-section-title">Acerca de mí</h2>
            <p className="profile-description">
              {profile.description ||
                "Aún no has añadido una descripción profesional."}
            </p>
          </div>

          {/* Certificates section */}
          <div className="profile-content-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Certificados</h2>
              <span className="profile-section-count">
                {profile.certificates?.length || 0}
              </span>
            </div>
            {/* Certificates section */}
            <div className="profile-content-section">
              <div className="certificates-grid">
                {Array.isArray(profile.certificates) &&
                profile.certificates.length > 0 ? (
                  profile.certificates.map((certUrl, index) => {
                    const extension = certUrl.split(".").pop()?.toLowerCase();
                    const isImage = ["jpg", "jpeg", "png", "gif"].includes(
                      extension || ""
                    );
                    const isPDF = extension === "pdf";

                    return (
                      <div key={index} className="certificate-card">
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
                                alt={`Miniatura PDF ${index + 1}`}
                                className="certificate-image"
                              />
                            ) : (
                              <div className="pdf-loading">
                                Generando vista previa...
                              </div>
                            )
                          ) : (
                            <div className="certificate-file-icon">
                              <svg viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <a
                          href={`${STATIC_URL}${certUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="certificate-link"
                        >
                          Ver certificado
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-certificates">
                    <svg className="empty-icon" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      <path d="M14 2v6h6M12 18v-6M9 15h6" />
                    </svg>
                    <p>No hay certificados</p>
                  </div>
                )}
              </div>
            </div>{" "}
          </div>

          {/* Reviews section - aquí las reseñas al final */}
          <div className="profile-content-section">
            <h2 className="profile-section-title">Reseñas y Puntuación</h2>
            {reviews.length === 0 ? (
              <p>No hay reseñas aún.</p>
            ) : (
              <div className="review-grid">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-card-header">
                      <img
                        src={
                          review.client.avatar
                            ? `${STATIC_URL}${review.client.avatar}`
                            : "/user/default-avatar.png"
                        }
                        alt={`${review.client.name} ${review.client.lastName}`}
                        className="review-card-avatar"
                      />
                      <div>
                        <p className="review-card-name">
                          {review.client.name} {review.client.lastName}
                        </p>
                        <p className="review-card-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="review-card-rating">⭐ {review.rating}</div>
                    <p className="review-card-comment">
                      {review.comment || "Sin comentario"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <ProfessionalProfileEditForm
          form={form}
          specialties={specialties}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onCancel={() => setEditing(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default Profile;
