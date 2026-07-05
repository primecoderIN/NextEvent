import { lazy, Suspense } from "react"
import type { RouteObject } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"
import { useEvents } from "@/shared/hooks/useEvents"

const HomePage = lazy(() => import("./home/page").then((m) => ({ default: m.HomePage })))
const EventDetailPage = lazy(() => import("./event-detail/page").then((m) => ({ default: m.EventDetailPage })))

// Auth pages (technically public as they are non-gated)
const LoginPage = lazy(() => import("@/features/auth/index").then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import("@/features/auth/index").then((m) => ({ default: m.RegisterPage })))

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function HomePageWrapper() {
  const { events, loading, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents()
  return (
    <Suspense fallback={<PageLoader />}>
      <HomePage
        events={events}
        loading={loading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </Suspense>
  )
}

export const publicRoutes: RouteObject[] = [
  {
    path: RoutePaths.Home,
    element: <HomePageWrapper />
  },
  {
    path: RoutePaths.EventDetail,
    element: (
      <Suspense fallback={<PageLoader />}>
        <EventDetailPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.Login,
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    )
  },
  {
    path: RoutePaths.Register,
    element: (
      <Suspense fallback={<PageLoader />}>
        <RegisterPage />
      </Suspense>
    )
  }
]
