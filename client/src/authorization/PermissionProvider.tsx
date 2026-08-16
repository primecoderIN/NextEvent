import React, { createContext, type ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { PermissionsContextType } from "./types";
import { Roles, type RoleName } from "@/shared/constants/roles";

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  const roles = (user?.roles ?? []).filter((role) => {
    if (role.toLowerCase() === Roles.Organizer.toLowerCase() && user?.activeProfile !== "Organizer") {
      return false;
    }
    return true;
  });

  const hasRole = (role: RoleName): boolean =>
    roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase());

  const hasAnyRole = (requiredRoles: RoleName[]): boolean =>
    requiredRoles.some((role) => hasRole(role));

  return (
    <PermissionsContext.Provider
      value={{
        roles,
        isAuthenticated: !!user,
        isLoading: loading,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
