import { Loader2, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteEventDialogProps {
  open: boolean
  eventTitle: string
  loading: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteEventDialog({
  open,
  eventTitle,
  loading,
  error,
  onConfirm,
  onCancel,
}: DeleteEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-7 w-7 text-destructive" />
            </div>
          </div>

          <DialogTitle className="text-center">Delete Event</DialogTitle>

          <DialogDescription className="text-center">
            You are about to permanently delete{" "}
            <span className="font-semibold text-foreground">"{eventTitle}"</span>
            . This action{" "}
            <span className="font-semibold text-destructive">cannot be undone</span>{" "}
            and will remove the event for all attendees.
          </DialogDescription>
        </DialogHeader>

        {/* API error */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}

        <DialogFooter>
          <Button
            id="delete-cancel"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            id="delete-confirm"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 sm:flex-none gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Yes, Delete Event
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
