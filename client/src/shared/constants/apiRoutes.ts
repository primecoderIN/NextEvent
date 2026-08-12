export const CategoryApiRoutes = {
  Base: "/categories",
  Suggest: "/categories/suggest",
  Suggestions: "/categories/suggestions",
  Approve: (id: string) => `/categories/${id}/approve`,
  Reject: (id: string) => `/categories/${id}/reject`,
};

export const OrganizationApiRoutes = {
  Base: "/organizations",
  Id: (id: string) => `/organizations/${id}`,
  Slug: (slug: string) => `/organizations/${slug}`,
  Approve: (id: string) => `/organizations/${id}/approve`,
  Roles: (id: string) => `/organizations/${id}/roles`,
  RoleUpdate: (id: string, roleId: string) => `/organizations/${id}/roles/${roleId}`,
  Members: (id: string) => `/organizations/${id}/members`,
  MemberRoles: (id: string, memberId: string) => `/organizations/${id}/members/${memberId}/roles`,
  MemberInvite: (id: string) => `/organizations/${id}/members/invite`
};

export const PermissionApiRoutes = {
  Base: "/permissions"
};
