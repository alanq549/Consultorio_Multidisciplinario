import React from "react";
import type { User } from "../../types/user";
import { useNavigate } from "react-router-dom";

interface Props {
  user: User;
    onViewProfile: (id: number) => void;

}

export const UserCard: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const STATIC_URL = import.meta.env.VITE_BACKEND_STATIC_URL || "";

  let userImage: string | null = null;
  if (user.role === "PROFESSIONAL" && user.professionalProfile?.photoUrl) {
    userImage = `${STATIC_URL}${user.professionalProfile.photoUrl}`;
  } else if (user.avatar) {
    userImage = `${STATIC_URL}${user.avatar}`;
  }

  return (
    <div className="user-card">
      <img
        src={userImage || "/user/default-avatar.png"}
        alt={user.name}
        className="user-avatar"
      />
      <div className="user-info">
        <h3 className="user-name">{user.name}</h3>
        <p className="user-role">
          {user.role === "PROFESSIONAL"
            ? user.professionalProfile?.specialty?.name || "Profesional de salud"
            : "Paciente"}
        </p>

        <div className="flex gap-2 mt-1">
          <span
            className={
              user.role === "PROFESSIONAL"
                ? "professional-badge"
                : "client-badge"
            }
          >
            {user.role === "PROFESSIONAL" ? "Profesional" : "Paciente"}
          </span>
          {user.professionalProfile?.isVerified && (
            <span className="verified-badge">Verificado</span>
          )}
        </div>

{user.role === "PROFESSIONAL" && (
  <button
    onClick={() => navigate(`/dashboard/admin/professionals/${user.id}`)}
    className="profile-button"
  >
    Ver perfil completo →
  </button>
)}

      </div>
    </div>
  );
};
