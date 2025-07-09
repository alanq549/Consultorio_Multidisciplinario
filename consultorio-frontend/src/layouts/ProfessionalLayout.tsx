// layouts/ProfessionalLayout.tsx
import Sidebar from "../components/ui/Sidebar";
import UserMenu from "../components/ui/UserMenu";
import BaseLayout from "./BaseLayout";

const ProfessionalLayout = () => {
  const header = (
    <div className="absolute top-4 right-6">
      <UserMenu />
    </div>
  );

  return (
    <BaseLayout 
      sidebar={<Sidebar />}
      header={header}
    />
  );
};

export default ProfessionalLayout;