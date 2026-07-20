import { Navigate, useLocation } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { LoadingSpinner } from "./LoadingSpinner";

/**
 * Wraps a route's children and redirects to /login when the user is not
 * authenticated. Shows a full-screen spinner while the session is resolving.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();

  if (isPending) {
    return <LoadingSpinner fullScreen />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
