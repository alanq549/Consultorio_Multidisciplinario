/// router/index.tsx
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLayout from "../layouts/AdminLayout";
import ClientLayout from "../layouts/ClientLayout";
import ProfessionalLayout from "../layouts/ProfessionalLayout";
import AdminDashboard from "../pages/Dashboard/admin";
import ClientDashboard from "../pages/Dashboard/client";
import Book from "../pages/Dashboard/client/Book";
import ClientAppointments from "../pages/Dashboard/client/ClientAppointments";
import History from "../pages/Dashboard/client/History";
import ProDashboard from "../pages/Dashboard/professional";
import Specialties from "../pages/Dashboard/admin/Specialties";
import Users from "../pages/Dashboard/admin/Users";
import Services from "../pages/Dashboard/admin/Services";
import Appointments from "../pages/Dashboard/admin/Appointments";
import RequireAuth from "./RequireAuth";
import Sopport from "../pages/Dashboard/admin/Sopport";
import Configuration from "../pages/Dashboard/admin/Configuration";
import Reports from "../pages/Dashboard/admin/Reports";
import CompleteProfile from "../pages/Dashboard/professional/CompleteProfile";
import Schedule from "../pages/Dashboard/professional/Schedule";
import Profile from "../pages/Dashboard/professional/Profile";
import Servicesp from "../pages/Dashboard/professional/Services";
import AppointmentsP from "../pages/Dashboard/professional/Appointments";
import ProfessionalProfilePage from "../components/ui/ProfessionalProfilePage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Layout ADMIN  */}
      <Route
        path="/dashboard/admin"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AdminLayout />
          </RequireAuth>
          
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="specialties" element={<Specialties />} />
        <Route path="services" element={<Services />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="configuration" element={<Configuration />} />
        <Route path="support" element={<Sopport />} />
        <Route path="professionals/:id" element={<ProfessionalProfilePage />} />
      </Route>
      {/* Layout CLIENT */}

      <Route
        path="/dashboard/client"
        element={
          <RequireAuth allowedRoles={["CLIENT"]}>
            <ClientLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="book" element={<Book />} />
        <Route path="appointments" element={<ClientAppointments />} />
        <Route path="history" element={<History />} />
        <Route path="professionals/:id" element={<ProfessionalProfilePage />} />
      </Route>

      {/* Layout PROFESSIONAL */}

      <Route
        path="/dashboard/professional"
        element={
          <RequireAuth allowedRoles={["PROFESSIONAL"]}>
            <ProfessionalLayout />
          </RequireAuth>
        }
      >
        <Route index element={<ProDashboard />} />
        {/* otras rutas pro aquí */}
        <Route path="profile" element={<Profile />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="services" element={<Servicesp />} />
        <Route path="Appointments" element={<AppointmentsP />} />
      </Route>
      <Route
        path="/professional/complete-profile"
        element={
          <RequireAuth allowedRoles={["PROFESSIONAL"]}>
            <CompleteProfile />
          </RequireAuth>
        }
      />

      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  );
}
