import React from "react";
import { UserCard } from "./UserCard";
import type { User } from "../../types/user";

interface Props {
  users: User[];
  onViewProfile: (id: number) => void;
}

const isProfessional = (user: User): user is User & { role: "PROFESSIONAL" } =>
  user.role === "PROFESSIONAL";

const isClient = (user: User): user is User & { role: "CLIENT" } =>
  user.role === "CLIENT";

export const UserList: React.FC<Props> = ({ users, onViewProfile }) => {
  const professionals = users.filter(isProfessional);
  const clients = users.filter(isClient);

  return (
    <div className="user-list">
      {professionals.length > 0 && (
        <section className="user-section">
          <h2 className="section-title">Profesionales de Salud</h2>
          <div className="user-grid">
            {professionals.map((user) => (
              <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />
            ))}
          </div>
        </section>
      )}

      {clients.length > 0 && (
        <section className="user-section">
          <h2 className="section-title">Pacientes</h2>
          <div className="user-grid">
            {clients.map((user) => (
              <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
