import { useNavigate } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { RoutePaths } from "@/constants/routePaths"

/**
 * "Become an Organizer" conversion CTA section.
 * Encourages visitors to create and host their own events.
 */
export function OrganizerCTA() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border border-primary/20 p-6 md:p-8">
      {/* Decorative orb */}
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold">Become an Organizer</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">
            Have an idea for an event? Create, manage and sell tickets to your own events
            and reach thousands of attendees on NextEvent.
          </p>
        </div>

        <button
          onClick={() => navigate(RoutePaths.CreateEvent)}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all duration-150 whitespace-nowrap"
        >
          Start for Free
        </button>
      </div>
    </section>
  )
}
