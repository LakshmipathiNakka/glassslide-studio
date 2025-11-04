import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { AUTH_CONFIG } from "@/auth/config";
import { deleteCookie } from "@/auth/cookies";

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="w-full h-screen flex items-center justify-center">Checking session…</div>;

  if (!isAuthenticated) {
    // Clear any stale auth cookies
    deleteCookie(AUTH_CONFIG.tokenCookie);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
