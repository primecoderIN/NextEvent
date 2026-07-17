export const RoutePaths = {
  // ─── Public ─────────────────────────────────────────────────────────────────
  Home: "/",
  Login: "/login",
  Register: "/register",
  OrganizationProfile: "/organizations/:slug",
  EventDetail: "/events/:id",
  EventDetailLink: (id: string) => `/events/${id}`,
  EventEditLink: (id: string) => `/organizer/events/${id}/edit`,
  Profile: "/profile",

  // ─── Organizer ──────────────────────────────────────────────────────────────
  CreateEvent: "/organizer/events/new",
  EditEvent: "/organizer/events/:id/edit",
  StartOrganizer: "/organizer/start",
  OrganizerManageRoles: "/organizer/organizations/:id/roles",
  OrganizerOrganizationDetail: "/organizer/organizations/:id",
  OrganizerDashboard: "/organizer/dashboard",

  // ─── Admin ──────────────────────────────────────────────────────────────────
  Admin: "/admin",

  AdminDashboard: "/admin/dashboard",
  AdminEvents: "/admin/events",
  AdminCategories: "/admin/categories",
  AdminCategoryNew: "/admin/categories/new",
  AdminCategorySuggestions: "/admin/categories/suggestions",
  AdminUsers: "/admin/users",
  AdminOrganizations: "/admin/organizations",
  AdminOrganizationDetail: "/admin/organizations/:id",
  AdminReports: "/admin/reports",
  AdminSettings: "/admin/settings",
  AdminActivityLogs: "/admin/activity-logs",
} as const;
