export const CategoryApiRoutes = {
  Base: "/categories",
  Suggest: "/categories/suggest",
  Suggestions: "/categories/suggestions",
  Approve: (id: string) => `/categories/${id}/approve`,
  Reject: (id: string) => `/categories/${id}/reject`,
};
