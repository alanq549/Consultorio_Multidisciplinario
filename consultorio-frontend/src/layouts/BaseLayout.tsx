import { Outlet } from "react-router-dom";
import "../styles/layouts/BaseLayout.css";

interface BaseLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

const BaseLayout = ({ sidebar, header }: BaseLayoutProps) => {
  return (
    <div className="layout-container">
      {sidebar && <div className="layout-sidebar">{sidebar}</div>}

      <div className="layout-content-wrapper">
        {header && header}

        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
