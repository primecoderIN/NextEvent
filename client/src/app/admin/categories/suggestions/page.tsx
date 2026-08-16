import { useState } from "react"
import { Check, X, Lightbulb, ChevronLeft, ChevronRight } from "lucide-react"

import { useCategorySuggestions } from "@/shared/hooks/useCategorySuggestions"
import { Roles } from "@/shared/constants/roles"
import { RequireRole } from "@/authorization"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

export function AdminCategorySuggestionsPage() {
  const { 
    suggestions = [], 
    isLoading, 
    approve, 
    reject, 
    isApproving, 
    isRejecting 
  } = useCategorySuggestions()

  const [page, setPage] = useState(1)
  const pageSize = 10

  const totalPages = Math.ceil(suggestions.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedSuggestions = suggestions.slice(startIndex, startIndex + pageSize)

  const handleApprove = async (id: string) => {
    try {
      await approve(id)
      toast.success("Category suggestion approved!")
    } catch {
      toast.error("Failed to approve suggestion")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await reject(id)
      toast.success("Category suggestion rejected!")
    } catch {
      toast.error("Failed to reject suggestion")
    }
  }

  return (
    <RequireRole role={Roles.Admin} fallback={<div className="p-6">Not authorized</div>}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            Category Suggestions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage category suggestions submitted by organizers.
          </p>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Suggestion</TableHead>
                  <TableHead>Suggested By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedSuggestions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No category suggestions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSuggestions.map((suggestion) => (
                    <TableRow key={suggestion.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-medium text-foreground">{suggestion.name}</div>
                        {suggestion.description && (
                          <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[250px]">
                            {suggestion.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {suggestion.suggestedByDisplayName || "Unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(suggestion.createdAtUtc), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            suggestion.status === "Pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            suggestion.status === "Approved" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                            "bg-destructive/10 text-destructive border-destructive/20"
                          }
                        >
                          {suggestion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {suggestion.status === "Pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                              onClick={() => handleReject(suggestion.id)}
                              disabled={isApproving || isRejecting}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleApprove(suggestion.id)}
                              disabled={isApproving || isRejecting}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {suggestions.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, suggestions.length)} of{" "}
                {suggestions.length} suggestions
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 5 && page > 3) p = page - 2 + i;
                  if (p > totalPages) return null;

                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  )
}
