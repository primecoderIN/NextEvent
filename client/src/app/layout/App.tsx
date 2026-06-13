import { Navbar } from "./Navbar"
import { DesktopSidebar } from "./DesktopSidebar"

import { RightSidebar } from "./RightSidebar"
import { HomePage } from "@/features/home/HomePage"
import { useEvents } from "@/hooks/useEvents"

function App() {
  const { events, loading } = useEvents()

  return (
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
          <HomePage events={events} loading={loading} />
        </main>
      </div>


    </div>
  )
}

export default App
