import { Roles, type RoleName } from "@/shared/constants/roles";
import { RoutePaths } from "@/shared/constants/routePaths";

export function hasRoleInList(roles: string[] | undefined, role: RoleName) {
  return roles?.some((userRole) => userRole.toLowerCase() === role.toLowerCase()) ?? false;
}

export function getPostLoginRoute(roles: string[] | undefined, fallbackPath: string) {
  if (hasRoleInList(roles, Roles.Admin)) return RoutePaths.AdminDashboard;
  if (hasRoleInList(roles, Roles.Organizer)) return RoutePaths.OrganizerDashboard;

  return fallbackPath;
}
