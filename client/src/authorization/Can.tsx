import React, { type ReactNode } from "react";
import { useAuthorization } from "./useAuthorization";
import type { Permission } from "./types";

interface CanProps {
  permission: Permission;
  resource?: any;
  children: ReactNode;
  fallback?: ReactNode;
}

export const Can: React.FC<CanProps> = ({ 
  permission, 
  resource, 
  children, 
  fallback = null 
}) => {
  const { can } = useAuthorization();
  if (can(permission, resource)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
};
