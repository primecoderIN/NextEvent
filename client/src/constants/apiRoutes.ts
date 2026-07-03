export const CategoryApiRoutes = {
  Base: "/categories",
  Suggest: "/categories/suggest",
  Approve: (id: string) => `/categories/${id}/approve`,
};
