export type Permission = 
  | "events.create"
  | "events.edit"
  | "events.delete"
  | "events.publish"
  | "events.ban"
  | "categories.manage";

export interface PermissionsContextType {
  can: (permission: Permission, resource?: any) => boolean;
}
