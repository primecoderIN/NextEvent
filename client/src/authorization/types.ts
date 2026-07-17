import type { RoleName } from "@/shared/constants/roles";
import type { Permission } from "@/shared/constants/permissions";

export type RoleRequirement = RoleName | RoleName[];
export type { Permission };

export interface PermissionsContextType {
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: RoleName) => boolean;
  hasAnyRole: (roles: RoleName[]) => boolean;
  can: (permission: Permission, resource?: any) => boolean;
}
