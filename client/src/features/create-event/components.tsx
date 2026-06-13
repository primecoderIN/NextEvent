// ─── Shared UI primitives used across all Create Event sections ───────────────
import { AlertCircle } from "lucide-react"

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  )
}

export function SectionTitle({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <h3 className="font-bold text-base">{title}</h3>
    </div>
  )
}

export function Divider() {
  return <hr className="border-border/40" />
}
