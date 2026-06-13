import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreateEventSuccessProps {
  eventId: string
  onViewEvent: () => void
  onBackHome: () => void
}

export function CreateEventSuccess({
  onViewEvent,
  onBackHome,
}: CreateEventSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5">
      <div
        className="h-20 w-20 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
      >
        <CheckCircle2 className="h-10 w-10 text-white" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Event Created! 🎉</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Your event has been successfully published and is now live.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button
          onClick={onViewEvent}
          className="px-6"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          View Event
        </Button>
        <Button variant="outline" onClick={onBackHome}>
          Back to Home
        </Button>
      </div>
    </div>
  )
}
