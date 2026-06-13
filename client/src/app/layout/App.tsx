import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "@/app/layout/Navbar"
import { DesktopSidebar } from "@/app/layout/DesktopSidebar"
import { RightSidebar } from "@/app/layout/RightSidebar"
import { useEvents } from "@/hooks/useEvents"

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
  const { events, loading } = useEvents()

  return (
    <BrowserRouter>
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
                  path="/"
                  element={<HomePage events={events} loading={loading} />}
                />
                <Route path="/events/new" element={<CreateEventPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
