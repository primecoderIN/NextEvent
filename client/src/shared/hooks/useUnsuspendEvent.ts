import { useState } from "react"
import { type AxiosError } from "axios"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

export function useUnsuspendEvent() {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const unsuspendEvent = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await axiosHttpAgent.post<ApiResponse<null>>(`/events/${id}/unsuspend`)
      toast.success("Event suspension revoked successfully")
      queryClient.invalidateQueries({ queryKey: ["admin", "events"] })
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiResponse<null>>
      const errMsg = axiosErr.response?.data?.message || "Failed to unsuspend event"
      setError(errMsg)
      toast.error(errMsg)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { unsuspendEvent, loading, error }
}
