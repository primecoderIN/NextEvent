import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { RoutePaths } from "@/shared/constants/routePaths"
import { useCategorySuggestions } from "@/shared/hooks/useCategorySuggestions"

export function CategorySuggestionsWidget() {
  const navigate = useNavigate()
  const { suggestions, isLoading: suggestionsLoading, approve, reject, isApproving, isRejecting } =
    useCategorySuggestions()

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold">Category Suggestions</h2>
        <button
          onClick={() => navigate(RoutePaths.AdminCategorySuggestions)}
          className="text-xs text-primary font-medium hover:underline"
        >
          View All
        </button>
      </div>

      {suggestionsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No pending suggestions</p>
      ) : (
        <div className="space-y-3">
          {suggestions.slice(0, 5).map((s) => {
            const ago = new Date(s.createdAtUtc).toLocaleDateString("en-US", {
              month: "short", day: "numeric",
            })
            return (
              <div key={s.id} className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Suggested by: {s.suggestedByDisplayName}
                  </p>
                  <p className="text-xs text-muted-foreground">{ago}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => approve(s.id).catch(() => toast.error("Failed to approve"))}
                    disabled={isApproving}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(s.id).catch(() => toast.error("Failed to reject"))}
                    disabled={isRejecting}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors disabled:opacity-60"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {suggestions.length > 5 && (
        <button
          onClick={() => navigate(RoutePaths.AdminCategorySuggestions)}
          className="mt-4 w-full text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          View All Suggestions →
        </button>
      )}
    </div>
  )
}
