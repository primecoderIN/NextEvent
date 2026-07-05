export const RoutePaths = {
  // ─── Public ─────────────────────────────────────────────────────────────────
  Home: "/",
  Login: "/login",
  Register: "/register",
  CreateEvent: "/events/new",
  EventDetail: "/events/:id",
  EditEvent: "/events/:id/edit",
  EventDetailLink: (id: string) => `/events/${id}`,
  EventEditLink: (id: string) => `/events/${id}/edit`,
  Profile: "/profile",

  // ─── Admin ──────────────────────────────────────────────────────────────────
  Admin: "/admin",
  AdminDashboard: "/admin/dashboard",
  AdminEvents: "/admin/events",
  AdminCategories: "/admin/categories",
  AdminCategoryNew: "/admin/categories/new",
  AdminCategorySuggestions: "/admin/categories/suggestions",
  AdminUsers: "/admin/users",
  AdminOrganizations: "/admin/organizations",
  AdminReports: "/admin/reports",
  AdminSettings: "/admin/settings",
  AdminActivityLogs: "/admin/activity-logs",
} as const;
