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
import ClientAppointments from "../pages/Dashboard/client/";
import History from "../pages/Dashboard/client/History";
import ProDashboard from "../pages/Dashboard/professional";
import Specialties from "../pages/Dashboard/admin/Specialties";
import Users from "../pages/Dashboard/admin/Users";
import Services from "../pages/Dashboard/admin/Services";
import Appointments from "../pages/Dashboard/admin/Appointments";
import RequireAuth from "./RequireAuth";

export default function AppRouter() {

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Layout ADMIN */}
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
        </Route>

      <Route path="*" element={<h1>Página no encontrada</h1>} />

    </Routes>
  );
}
