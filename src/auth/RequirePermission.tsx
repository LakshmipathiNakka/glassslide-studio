import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { hasPermission } from "@/auth/jwt";

export const RequirePermission: React.FC<{ children: React.ReactElement; permission: string }> = ({ children, permission }) => {
  const { isAuthenticated, token, isLoading } = useAuth() as any;
  const location = useLocation();

  if (isLoading) return <div className="w-full h-screen flex items-center justify-center">Checking permissions…</div>;

  if (!isAuthenticated || !token || !hasPermission(token, permission)) {
    return <Navigate to="/" replace state={{ from: location, reason: "forbidden" }} />;
  }

  return children;
};
