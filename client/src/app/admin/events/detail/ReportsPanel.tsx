import { useEventReports } from "@/shared/hooks/useEventReports"
import { AlertCircle, FileText } from "lucide-react"

export function ReportsPanel({ eventId }: { eventId: string }) {
  const { reports, loading, error } = useEventReports(eventId)

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading reports...</div>
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (reports.length === 0) {
    return <div className="p-4 text-sm text-muted-foreground">No reports filed for this event.</div>
  }

  return (
    <div className="divide-y divide-border/40">
      {reports.map((report) => (
        <div key={report.id} className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              <span>Report ID: {report.id.substring(0, 8)}...</span>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-foreground bg-muted/30 p-2.5 rounded-md border border-border/40">
            "{report.reason}"
          </p>
          <div className="text-xs text-muted-foreground pt-1">
            Reported by User: <span className="font-mono">{report.reportedById}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
