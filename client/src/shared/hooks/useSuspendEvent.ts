import { useState } from "react"
import { type AxiosError } from "axios"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import { toast } from "sonner"

export function useSuspendEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const suspendEvent = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    
    try {
      await axiosHttpAgent.post<ApiResponse<null>>(`/events/${id}/suspend`)
      toast.success("Event suspended successfully")
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiResponse<null>>
      const errMsg = axiosErr.response?.data?.message || "Failed to suspend event"
      setError(errMsg)
      toast.error(errMsg)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { suspendEvent, loading, error }
}
