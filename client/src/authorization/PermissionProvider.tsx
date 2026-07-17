import React, { createContext, type ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Permission, PermissionsContextType } from "./types";
import { Roles, type RoleName } from "@/shared/constants/roles";
import { Permissions } from "@/shared/constants/permissions";

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const permissionAliases: Partial<Record<Permission, Permission>> = {
  [Permissions.EventsEdit]: Permissions.EventsUpdate,
  [Permissions.EventsDelete]: Permissions.EventsCancel,
};

const rolePermissions: Record<RoleName, Permission[]> = {
  [Roles.Admin]: [
    Permissions.OrganizationView,
    Permissions.OrganizationUpdate,
    Permissions.OrganizationMembersInvite,
    Permissions.OrganizationMembersRemove,
    Permissions.OrganizationRolesManage,
    Permissions.EventsCreate,
    Permissions.EventsUpdate,
    Permissions.EventsPublish,
    Permissions.EventsCancel,
    Permissions.EventsBan,
    Permissions.OrdersView,
    Permissions.AttendeesCheckin,
    Permissions.CouponsManage,
    Permissions.AnnouncementsManage,
    Permissions.AnalyticsView,
    Permissions.CategoriesManage,
  ],
  [Roles.Organizer]: [
    Permissions.OrganizationView,
    Permissions.OrganizationUpdate,
    Permissions.OrganizationRolesManage,
    Permissions.EventsCreate,
    Permissions.EventsUpdate,
    Permissions.EventsPublish,
    Permissions.EventsCancel,
    Permissions.OrdersView,
    Permissions.AttendeesCheckin,
    Permissions.CouponsManage,
    Permissions.AnnouncementsManage,
    Permissions.AnalyticsView,
  ],
  [Roles.Member]: [],
};

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  const roles = user?.roles ?? [];

  const hasRole = (role: RoleName): boolean =>
    roles.some((userRole) => userRole.toLowerCase() === role.toLowerCase());

  const hasAnyRole = (requiredRoles: RoleName[]): boolean =>
    requiredRoles.some((role) => hasRole(role));

  const can = (permission: Permission, resource?: any): boolean => {
    if (!user) return false;

    const normalizedPermission = permissionAliases[permission] ?? permission;
    const hasPermission = roles.some((role) => {
      const roleName = Object.values(Roles).find(
        (knownRole) => knownRole.toLowerCase() === role.toLowerCase()
      );

      if (!roleName) return false;

      return rolePermissions[roleName].includes(normalizedPermission);
    });

    if (!hasPermission) return false;

    if (resource) {
      if (hasRole(Roles.Admin)) return true;
    }

    return true;
  };

  return (
    <PermissionsContext.Provider
      value={{
        roles,
        isAuthenticated: !!user,
        isLoading: loading,
        hasRole,
        hasAnyRole,
        can,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
