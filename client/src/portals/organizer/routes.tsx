import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"
import { RoutePaths } from "@/constants/routePaths"

const CreateEventPage = lazy(() => import("./pages/create-event/index").then((m) => ({ default: m.CreateEventPage })))
const UpdateEventPage = lazy(() => import("./pages/update-event/index").then((m) => ({ default: m.UpdateEventPage })))

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
        <CreateEventPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.EditEvent,
    element: (
      <Suspense fallback={<PageLoader />}>
        <UpdateEventPage />
      </Suspense>
    )
  }
]
