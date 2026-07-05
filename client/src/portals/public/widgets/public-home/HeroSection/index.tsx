import { useNavigate } from "react-router-dom"
import type { Event } from "@/Types/Event"
import { FeaturedCarousel } from "@/portals/public/widgets/common/FeaturedCarousel"
import { RoutePaths } from "@/constants/routePaths"

interface HeroSectionProps {
  events: Event[]
}

// Avatar placeholders — social proof row beneath the CTA
const AVATAR_SEEDS = ["alice", "bob", "carol", "david"]

/**
 * Split-layout hero section matching the design:
 * - Left: headline (with "events" in primary colour), subtext, CTA button, social proof
 * - Right: existing FeaturedCarousel
 */
export function HeroSection({ events }: HeroSectionProps) {
  const navigate = useNavigate()

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8 lg:gap-12 items-center py-6 md:py-10">
      {/* ── Left: copy + CTA ── */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Discover amazing{" "}
            <span className="text-primary">events</span>{" "}
            happening around you.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm">
            Find events that match your interests, connect with people and create memories.
          </p>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => navigate(RoutePaths.Home)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
        >
          Explore Events
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>

        {/* Social proof */}
        <div className="flex items-center gap-3">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {AVATAR_SEEDS.map((seed) => (
              <img
                key={seed}
                src={`https://i.pravatar.cc/32?u=${seed}`}
                alt=""
                className="h-8 w-8 rounded-full border-2 border-background object-cover"
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground leading-snug">
            Join thousands of people{" "}
            <span className="font-semibold text-foreground">discovering events</span>{" "}
            every day
          </p>
        </div>
      </div>

      {/* ── Right: featured carousel — 60% width, min-height so it reads large ── */}
      <div className="w-full min-h-[300px] lg:min-h-[380px]">
        <FeaturedCarousel events={events} />
      </div>
    </section>
  )
}
