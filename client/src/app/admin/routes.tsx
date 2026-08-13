import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"
import { AdminRouteGuard } from "./layouts/AdminRouteGuard"
import { RoutePaths } from "@/shared/constants/routePaths"

const AdminLayout = lazy(() => import("./layout").then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage = lazy(() => import("./dashboard/page").then((m) => ({ default: m.AdminDashboardPage })))
const AdminOrganizationsPage = lazy(() => import("./organizations/page").then((m) => ({ default: m.AdminOrganizationsPage })))
const AdminOrganizationDetailPage = lazy(() => import("./organizations/detail/page").then((m) => ({ default: m.AdminOrganizationDetailPage })))
const CreateCategoryPage = lazy(() => import("./categories/page").then((m) => ({ default: m.default })))
const AdminEventsPage = lazy(() => import("./events/page").then((m) => ({ default: m.AdminEventsPage })))
const AdminEventDetailPage = lazy(() => import("./events/detail/page").then((m) => ({ default: m.AdminEventDetailPage })))

function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

export const adminRoutes: RouteObject[] = [
  {
    path: `${RoutePaths.Admin}/*`,
    element: <AdminRouteGuard />,
    children: [
      {
        element: (
          <Suspense fallback={<AdminPageLoader />}>
            <AdminLayout />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            )
          },
          {
            path: "dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            )
          },
          {
            path: "organizations",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminOrganizationsPage />
              </Suspense>
            )
          },
          {
            path: "organizations/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminOrganizationDetailPage />
              </Suspense>
            )
          },
          {
            path: "categories/new",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CreateCategoryPage />
              </Suspense>
            )
          },
          {
            path: "events",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminEventsPage />
              </Suspense>
            )
          },
          {
            path: "events/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminEventDetailPage />
              </Suspense>
            )
          },
          {
            path: "*",
            element: (
              <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
                Coming soon…
              </div>
            )
          }
        ]
      }
    ]
  }
]
