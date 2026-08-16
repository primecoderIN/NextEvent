import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { CategoryApiRoutes } from "@/shared/constants/apiRoutes"

export interface CategorySuggestion {
  id: string
  name: string
  description?: string
  suggestedByDisplayName: string
  createdAtUtc: string
  status: "Pending" | "Approved" | "Rejected"
}

const QUERY_KEY = ["admin", "category-suggestions"] as const

const fetchSuggestions = async (): Promise<CategorySuggestion[]> => {
  const res = await axiosHttpAgent.get<ApiResponse<CategorySuggestion[]>>(
    CategoryApiRoutes.Suggestions
  )
  return res.data.data ?? []
}

const approveSuggestion = async (id: string): Promise<void> => {
  await axiosHttpAgent.post(CategoryApiRoutes.Approve(id))
}

const rejectSuggestion = async (id: string): Promise<void> => {
  await axiosHttpAgent.post(CategoryApiRoutes.Reject(id), { reason: "Rejected by admin" })
}

export function useCategorySuggestions() {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSuggestions,
  })

  const approve = useMutation({
    mutationFn: approveSuggestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  const reject = useMutation({
    mutationFn: rejectSuggestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  })

  return {
    suggestions: query.data ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    approve: approve.mutateAsync,
    reject: reject.mutateAsync,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
  }
}
