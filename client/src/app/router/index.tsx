import { createBrowserRouter } from "react-router-dom"
import { AppRoot } from "../layout/AppRoot"
import { PublicLayout } from "@/portals/public/layouts/PublicLayout"
import { adminRoutes } from "@/portals/admin/routes"
import { publicRoutes } from "@/portals/public/routes"
import { organizerRoutes } from "@/portals/organizer/routes"

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    children: [
      ...adminRoutes,
      {
        element: <PublicLayout />,
        children: [
          ...organizerRoutes,
          ...publicRoutes,
        ]
      }
    ]
  }
])
