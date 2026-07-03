import { lazy, Suspense } from "react"
import { Routes, Route } from "react-router-dom"
import { Navbar } from "@/app/layout/Navbar"
import { DesktopSidebar } from "@/app/layout/DesktopSidebar"
import { RightSidebar } from "@/app/layout/RightSidebar"
import { useEvents } from "@/hooks/useEvents"
import { Toaster } from "@/components/ui/sonner"
import { RoutePaths } from "@/constants/routePaths"

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
const CreateCategoryPage = lazy(() => import("@/features/admin/CreateCategoryPage").then((m) => ({ default: m.default })) )
const SuggestCategoryPage = lazy(() => import("@/features/categories/SuggestCategoryPage").then((m) => ({ default: m.default })) )

// ─── Fallback ─────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  // We extract the new pagination helpers (fetchNextPage, hasNextPage, isFetchingNextPage) 
  // from our useInfiniteQuery hook and pass them directly down to the HomePage.
  const { events, loading, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents()

  return (
      <div className="min-h-screen bg-background">
        <Toaster />
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
                  element={<HomePage events={events} loading={loading} fetchNextPage={fetchNextPage} hasNextPage={hasNextPage} isFetchingNextPage={isFetchingNextPage} />}
                />
                <Route path={RoutePaths.CreateEvent} element={<CreateEventPage />} />
                <Route path={RoutePaths.EditEvent} element={<UpdateEventPage />} />
                <Route path={RoutePaths.EventDetail} element={<EventDetailPage />} />
                <Route path={RoutePaths.Login} element={<LoginPage />} />
                <Route path={RoutePaths.Register} element={<RegisterPage />} />
                <Route path={RoutePaths.CreateCategory} element={<CreateCategoryPage />} />
                <Route path={RoutePaths.SuggestCategory} element={<SuggestCategoryPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
  )
}

export default App
