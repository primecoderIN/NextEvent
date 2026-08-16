import { createBrowserRouter } from "react-router-dom"
import { AppRoot } from "../layout/AppRoot"
import { PublicLayout } from "@/app/(public)/layout"
import { adminRoutes } from "@/app/admin/routes"
import { publicRoutes } from "@/app/(public)/routes"
import { organizerRoutes } from "@/app/organizer/routes"

import { OrganizerLayout } from "@/app/organizer/layout"
import { RequireProfile } from "@/authorization"
import { NotFoundPage } from "@/app/not-found/page"
import { ErrorPage } from "@/app/error/page"
import { GlobalErrorBoundary } from "@/shared/ui/GlobalErrorBoundary"

export const router = createBrowserRouter([
  {
    element: <AppRoot />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: "/error",
        element: <ErrorPage />
      },
      ...adminRoutes,
      {
        element: (
          <RequireProfile profile="Organizer" redirectTo="/login">
            <OrganizerLayout />
          </RequireProfile>
        ),
        children: organizerRoutes
      },
      {
        element: (
          <RequireProfile profile="Member" allowGuests={true}>
            <PublicLayout />
          </RequireProfile>
        ),
        children: publicRoutes
      },
      {
        path: "*",
        element: <NotFoundPage />
      }
    ]
  }
])
