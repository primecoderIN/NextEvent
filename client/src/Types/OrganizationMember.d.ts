export interface OrganizationMemberRole {
  id: string;
  name: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: string;
  joinedAtUtc: string | null;
  roles: OrganizationMemberRole[];
}
