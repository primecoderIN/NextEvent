import React, { type ReactNode } from "react";
import { RequirePermission } from "./RequirePermission";
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
}) => (
  <RequirePermission permission={permission} resource={resource} fallback={fallback}>
    {children}
  </RequirePermission>
);
