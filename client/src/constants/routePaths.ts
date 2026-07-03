export const RoutePaths = {
  Home: "/",
  Login: "/login",
  Register: "/register",
  CreateEvent: "/events/new",
  EventDetail: "/events/:id",
  EditEvent: "/events/:id/edit",
  EventDetailLink: (id: string) => `/events/${id}`,
  EventEditLink: (id: string) => `/events/${id}/edit`,
  CreateCategory: "/admin/categories/new",
  SuggestCategory: "/categories/suggest",
  Profile: "/profile",
} as const;
