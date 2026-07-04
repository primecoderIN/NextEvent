import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { Navbar } from "@/app/layout/Navbar"
import { DesktopSidebar } from "@/app/layout/DesktopSidebar"
import { RightSidebar } from "@/app/layout/RightSidebar"
import { useEvents } from "@/hooks/useEvents"
import { Toaster } from "@/components/ui/sonner"
import { RoutePaths } from "@/constants/routePaths"
import { Roles } from "@/constants/roles"
import { AdminRouteGuard } from "@/features/admin/AdminRouteGuard"
import { useAuth } from "@/features/auth/AuthContext"

// ─── Lazy-loaded page bundles ─────────────────────────────────────────────────
const HomePage = lazy(() =>
  import("@/features/home/index").then((m) => ({ default: m.HomePage }))
)
const EventDetailPage = lazy(() =>
  import("@/features/event-detail/index").then((m) => ({ default: m.EventDetailPage }))
)
const CreateEventPage = lazy(() =>
  import("@/features/create-event/index").then((m) => ({ default: m.CreateEventPage }))
)
const UpdateEventPage = lazy(() =>
  import("@/features/update-event/index").then((m) => ({ default: m.UpdateEventPage }))
)
const LoginPage = lazy(() =>
  import("@/features/auth/index").then((m) => ({ default: m.LoginPage }))
)
const RegisterPage = lazy(() =>
  import("@/features/auth/index").then((m) => ({ default: m.RegisterPage }))
)
const CreateCategoryPage = lazy(() =>
  import("@/features/admin/CreateCategoryPage").then((m) => ({ default: m.default }))
)
const SuggestCategoryPage = lazy(() =>
  import("@/features/categories/SuggestCategoryPage").then((m) => ({ default: m.default }))
)

// ─── Admin bundles — lazy, downloaded ONLY after AdminRouteGuard passes ───────
const AdminLayout = lazy(() =>
  import("@/features/admin/layout/AdminLayout").then((m) => ({ default: m.AdminLayout }))
)
const AdminDashboardPage = lazy(() =>
  import("@/features/admin/dashboard/index").then((m) => ({ default: m.AdminDashboardPage }))
)

// ─── Fallbacks ────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

function AdminPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

/**
 * Redirects admins who land on the main-app shell (e.g. direct visit to / or
 * after a page refresh where refresh-token auto-signs them in) straight to the
 * admin dashboard. While auth is still resolving we show nothing to avoid a
 * flash of the regular homepage.
 */
function AdminRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.roles?.includes(Roles.Admin)) {
    return <Navigate to={RoutePaths.AdminDashboard} replace />
  }
  return <>{children}</>
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { events, loading, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents()

  return (
    <>
      <Toaster />
      <Routes>

        {/* ── Admin section — role-gated, own layout, separate lazy bundle ─── */}
        <Route path={`${RoutePaths.Admin}/*`} element={<AdminRouteGuard />}>
          <Route
            element={
              <Suspense fallback={<AdminPageLoader />}>
                <AdminLayout />
              </Suspense>
            }
          >
            {/* /admin → dashboard */}
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            {/* /admin/dashboard */}
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            {/* Placeholder for future admin pages */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-sm">
                  Coming soon…
                </div>
              }
            />
          </Route>
        </Route>

        {/* ── Main app — standard layout (non-admin users only) ─────────────── */}
        <Route
          path="*"
          element={
            <AdminRedirect>
              <div className="min-h-screen bg-background">
                {/* Desktop left sidebar — fixed */}
                <DesktopSidebar />

                {/* Desktop right sidebar — fixed */}
                <RightSidebar events={events} />

                {/* Main content area */}
                <div className="lg:ml-56 xl:mr-80 flex flex-col min-h-screen">
                  {/* Mobile top navbar */}
                  <div className="lg:hidden sticky top-0 z-40">
                    <Navbar />
                  </div>

                  <main className="flex-1">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route
                          path={RoutePaths.Home}
                          element={
                            <HomePage
                              events={events}
                              loading={loading}
                              fetchNextPage={fetchNextPage}
                              hasNextPage={hasNextPage}
                              isFetchingNextPage={isFetchingNextPage}
                            />
                          }
                        />
                        <Route path={RoutePaths.CreateEvent}      element={<CreateEventPage />} />
                        <Route path={RoutePaths.EditEvent}        element={<UpdateEventPage />} />
                        <Route path={RoutePaths.EventDetail}      element={<EventDetailPage />} />
                        <Route path={RoutePaths.Login}            element={<LoginPage />} />
                        <Route path={RoutePaths.Register}         element={<RegisterPage />} />
                        <Route path={RoutePaths.AdminCategoryNew} element={<CreateCategoryPage />} />
                        <Route path={RoutePaths.SuggestCategory}  element={<SuggestCategoryPage />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
              </div>
            </AdminRedirect>
          }
        />

      </Routes>
    </>
  )
}

export default App
