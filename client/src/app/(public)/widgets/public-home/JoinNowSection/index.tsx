import { useNavigate } from "react-router-dom"
import { RoutePaths } from "@/shared/constants/routePaths"

const AVATAR_SEEDS = ["emma", "frank", "grace", "henry", "iris", "jack"]

/**
 * Final conversion section at the bottom of the public landing page.
 * Shows social proof avatars + headline + dual Sign Up / Log In CTAs.
 */
export function JoinNowSection() {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col items-center text-center gap-6 py-10">
      {/* Avatar stack */}
      <div className="flex -space-x-3">
        {AVATAR_SEEDS.map((seed) => (
          <img
            key={seed}
            src={`https://i.pravatar.cc/40?u=${seed}`}
            alt=""
            className="h-10 w-10 rounded-full border-2 border-background object-cover"
          />
        ))}
        <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-xs font-bold text-primary">
          +1K
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold">
          Join thousands of event-goers
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          Sign up free and start discovering events that match your passions, location and schedule.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(RoutePaths.Register)}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:opacity-90 active:scale-95 transition-all duration-150"
        >
          Sign Up Free
        </button>
        <button
          onClick={() => navigate(RoutePaths.Login)}
          className="px-6 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors duration-150"
        >
          Log In
        </button>
      </div>
    </section>
  )
}
