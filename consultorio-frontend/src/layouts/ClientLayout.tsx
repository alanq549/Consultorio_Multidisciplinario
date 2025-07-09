// layouts/ClientLayout.tsx
import ClientSidebar from "../components/ui/Sidebar"; // Deberías crear este componente
import UserMenu from "../components/ui/UserMenu";
import BaseLayout from "./BaseLayout";

const ClientLayout = () => {
  const header = (
    <div className="absolute top-4 right-6">
      <UserMenu />
    </div>
  );

  return (
    <BaseLayout 
      sidebar={<ClientSidebar />}
      header={header}
    />
  );
};

export default ClientLayout;