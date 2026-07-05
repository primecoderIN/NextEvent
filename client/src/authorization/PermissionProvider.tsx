import React, { createContext, type ReactNode } from "react";
import { useAuth } from "@/features/auth/context/AuthContext";
import type { Permission, PermissionsContextType } from "./types";

export const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "events.create", 
    "events.edit", 
    "events.delete", 
    "events.publish", 
    "events.ban", 
    "categories.manage"
  ],
  organizer: [
    "events.create", 
    "events.edit", 
    "events.delete", 
    "events.publish"
  ],
  user: []
};

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const can = (permission: Permission, resource?: any): boolean => {
    if (!user) return false;
    
    const userRoles = user.roles && user.roles.length > 0 ? user.roles : ["user"];

    const hasPermission = userRoles.some(role => {
      const perms = rolePermissions[role.toLowerCase()] || [];
      return perms.includes(permission);
    });

    if (!hasPermission) return false;

    // Resource-based ABAC checks
    if (resource) {
      const isAdmin = userRoles.some(r => r.toLowerCase() === "admin");
      if (isAdmin) return true;

      // In the future, check resource.organizerId === user.id
      // For now, allow if they have the role permission
    }

    return true;
  };

  return (
    <PermissionsContext.Provider value={{ can }}>
      {children}
    </PermissionsContext.Provider>
  );
};
