import { Outlet } from "react-router-dom";
import "../styles/layouts/BaseLayout.css";
import FloatingNotifications from "../components/ui/FloatingNotification";
import { ThemeProvider } from "../components/context/ThemeProvider";

interface BaseLayoutProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

const BaseLayout = ({ sidebar, header }: BaseLayoutProps) => {
  return (
    <ThemeProvider>
      <div className="layout-container">
        {sidebar}

        <div className="layout-content-wrapper">
          {header && header}

          <main className="layout-main">
            <Outlet />
          </main>
        </div>

        <FloatingNotifications />
      </div>
    </ThemeProvider>
  );
};


export default BaseLayout;
