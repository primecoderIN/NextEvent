import { useState } from "react"
import { Flag, Loader2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog"
import { useReportEvent } from "@/shared/hooks/useReportEvent"

interface ReportEventModalProps {
  eventId: string
}

export function ReportEventModal({ eventId }: ReportEventModalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const { reportEvent, loading } = useReportEvent()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason.trim()) return

    const success = await reportEvent(eventId, reason)
    if (success) {
      setOpen(false)
      setReason("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-destructive hover:bg-destructive/10">
          <Flag className="h-4 w-4" />
          Report Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Report Event</DialogTitle>
            <DialogDescription>
              Please describe why you are reporting this event. This will be reviewed by our moderation team.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g. Inappropriate content, spam, fake event..."
              className="col-span-3 min-h-[100px]"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={loading || !reason.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
