export function EventDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-7xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 lg:px-6 lg:border-b lg:border-border/40">
        <div className="h-5 w-32 bg-muted rounded-lg" />
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-muted rounded-full" />
          <div className="h-9 w-9 bg-muted rounded-full" />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_340px]">
        {/* Left */}
        <div className="lg:border-r lg:border-border/40">
          {/* Hero */}
          <div className="w-full bg-muted" style={{ aspectRatio: "16/7" }} />

          {/* Tabs */}
          <div className="px-4 md:px-6">
            <div className="flex gap-4 border-b border-border/40 mt-4 pb-3">
              {["About", "Schedule", "Venue"].map((t) => (
                <div key={t} className="h-4 w-16 bg-muted rounded" />
              ))}
            </div>
            <div className="py-6 space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
              <div className="h-3 bg-muted rounded w-4/6" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar skeleton (desktop only) */}
        <div className="hidden lg:block px-6 py-6 space-y-4">
          <div className="h-64 bg-muted rounded-2xl" />
          <div className="h-32 bg-muted rounded-2xl" />
          <div className="h-48 bg-muted rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
