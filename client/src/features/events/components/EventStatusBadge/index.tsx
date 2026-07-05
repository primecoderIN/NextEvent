import { CheckCircle, Clock, XCircle } from "lucide-react"

export function StatusBadge({ status }: { status: string }) {
  const lower = status?.toLowerCase() ?? ""
  if (lower === "published")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
        <CheckCircle className="h-3 w-3" /> Published
      </span>
    )
  if (lower === "reported")
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400">
        <Clock className="h-3 w-3" /> Reported
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
      <XCircle className="h-3 w-3" /> Unpublished
    </span>
  )
}
