import { useEffect, useState } from "react";
import { getAllUsers } from "../../../api/users";
import { UserList } from "../../../components/ui/UserList";
import type { User } from "../../../types/user";
import "../../../styles/ui/userComponents.css";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (err) {
        setError("Error al cargar los usuarios");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const navigate = useNavigate();

  const handleViewProfile = (id: number) => {
    // Navegar a la ruta /professional con query ?id=123
    navigate(`/professional?id=${id}`);
  };




  if (isLoading) return <div className="users-page">Cargando usuarios...</div>;
  if (error) return <div className="users-page text-red-600">{error}</div>;

  return (
    <div className="users-page">
      <h1 className="users-title">Gestión de Usuarios</h1>
      <UserList users={users} onViewProfile={handleViewProfile} />
    </div>
  );
};

export default Users;