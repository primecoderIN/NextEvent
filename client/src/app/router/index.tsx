import { createBrowserRouter } from "react-router-dom"
import { AppRoot } from "../layout/AppRoot"
import { PublicLayout } from "@/app/(public)/layout"
import { adminRoutes } from "@/app/admin/routes"
import { publicRoutes } from "@/app/(public)/routes"
import { organizerRoutes } from "@/app/organizer/routes"

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
