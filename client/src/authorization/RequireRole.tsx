import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthorization } from "./useAuthorization";
import type { RoleRequirement } from "./types";

interface RequireRoleProps {
  role: RoleRequirement;
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  redirectTo?: string;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export function RequireRole({
  role,
  children,
  fallback = null,
  loadingFallback = <PageLoader />,
  redirectTo,
}: RequireRoleProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, hasAnyRole } = useAuthorization();
  const roles = Array.isArray(role) ? role : [role];

  if (isLoading) return <>{loadingFallback}</>;

  if (!isAuthenticated && redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!hasAnyRole(roles)) return <>{fallback}</>;

  return <>{children}</>;
}
