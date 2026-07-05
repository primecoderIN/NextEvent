export const Roles = {
  Admin: "Admin",
  Organizer: "Organizer",
  Member: "Member",
} as const;

export type RoleName = (typeof Roles)[keyof typeof Roles];
