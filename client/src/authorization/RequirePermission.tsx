import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthorization } from "./useAuthorization";
import { useMyOrganization } from "@/shared/hooks/useMyOrganization";
import { useOrganizationPermissions } from "@/shared/hooks/useOrganizationPermissions";
import type { Permission } from "./types";

interface RequirePermissionProps {
  permission: Permission;
  resource?: unknown;
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

export function RequirePermission({
  permission,
  resource,
  children,
  fallback = null,
  loadingFallback = <PageLoader />,
  redirectTo,
}: RequirePermissionProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuthorization();
  const { data: myOrg } = useMyOrganization();
  
  const orgId = (resource as any)?.organizationId ?? myOrg?.id;
  const { can, isLoading: isPermissionsLoading } = useOrganizationPermissions(orgId);

  const isLoading = isAuthLoading || isPermissionsLoading;

  if (isLoading) return <>{loadingFallback}</>;

  if (!isAuthenticated && redirectTo) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (!can(permission)) return <>{fallback}</>;

  return <>{children}</>;
}
