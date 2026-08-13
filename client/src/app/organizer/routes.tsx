import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"
import { RequirePermission } from "@/authorization"
import { Permissions } from "@/shared/constants/permissions"

const CreateEventPage = lazy(() => import("./create-event/page").then((m) => ({ default: m.CreateEventPage })))
const UpdateEventPage = lazy(() => import("./update-event/page").then((m) => ({ default: m.UpdateEventPage })))
const OrganizerManageRolesPage = lazy(() => import("./roles/page").then((m) => ({ default: m.OrganizerManageRolesPage })))
const OrganizerOrganizationDetailPage = lazy(() => import("./organizations/detail/page").then((m) => ({ default: m.OrganizerOrganizationDetailPage })))
const OrganizerMyOrganizationPage = lazy(() => import("./organizations/page").then((m) => ({ default: m.OrganizerMyOrganizationPage })))
const OrganizerDashboardPage = lazy(() => import("./dashboard/page").then((m) => ({ default: m.OrganizerDashboardPage })))
const OrganizerEventsPage = lazy(() => import("./events/page").then((m) => ({ default: m.OrganizerEventsPage })))
const OrganizerEventDetailPage = lazy(() => import("./events/detail/page").then((m) => ({ default: m.OrganizerEventDetailPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

export const organizerRoutes: RouteObject[] = [
  {
    path: RoutePaths.CreateEvent,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RequirePermission permission={Permissions.EventsCreate} redirectTo={RoutePaths.Login}>
          <CreateEventPage />
        </RequirePermission>
      </Suspense>
    )
  },
  {
    path: RoutePaths.EditEvent,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RequirePermission permission={Permissions.EventsUpdate} redirectTo={RoutePaths.Login}>
          <UpdateEventPage />
        </RequirePermission>
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerManageRoles,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RequirePermission permission={Permissions.OrganizationRolesManage} redirectTo={RoutePaths.Login}>
          <OrganizerManageRolesPage />
        </RequirePermission>
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerOrganizationDetail,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RequirePermission permission={Permissions.OrganizationView} redirectTo={RoutePaths.Login}>
          <OrganizerOrganizationDetailPage />
        </RequirePermission>
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerMyOrganization,
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerMyOrganizationPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerEvents,
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerEventsPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerEventDetail,
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerEventDetailPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.OrganizerDashboard,
    element: (
      <Suspense fallback={<PageLoader />}>
        <OrganizerDashboardPage />
      </Suspense>
    )
  }
]
