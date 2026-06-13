import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "./Navbar"
import { DesktopSidebar } from "./DesktopSidebar"
import { RightSidebar } from "./RightSidebar"
import { HomePage } from "@/features/home/HomePage"
import { EventDetailPage } from "@/features/event-detail/EventDetailPage"
import { useEvents } from "@/hooks/useEvents"

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
            <Routes>
              <Route
                path="/"
                element={<HomePage events={events} loading={loading} />}
              />
              <Route path="/events/:id" element={<EventDetailPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
