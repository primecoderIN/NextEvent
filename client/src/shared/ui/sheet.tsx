import * as React from "react"
import { cn } from "@/shared/lib/utils"

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function BottomSheet({ open, onClose, children, className }: BottomSheetProps) {
  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Sheet panel */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-background shadow-2xl transition-transform duration-300 ease-in-out",
          open ? "translate-y-0" : "translate-y-full",
          className
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>
        {children}
      </div>
    </>
  )
}
