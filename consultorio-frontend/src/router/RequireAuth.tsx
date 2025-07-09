// components/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { JSX } from "react";

interface Props {
  children: JSX.Element;
  allowedRoles: ("ADMIN" | "CLIENT" | "PROFESSIONAL")[];
}

export default function RequireAuth({ children, allowedRoles }: Props) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
