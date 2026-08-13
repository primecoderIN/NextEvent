import { useState, useEffect, useCallback } from "react"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"
import type { EventReport } from "@/types/EventReport"
import { toast } from "sonner"

export function useEventReports(eventId: string) {
  const [reports, setReports] = useState<EventReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosHttpAgent.get<ApiResponse<EventReport[]>>(`/events/${eventId}/reports`)
      setReports(response.data.data || [])
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to fetch event reports"
      setError(errMsg)
      toast.error(errMsg)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (eventId) {
      fetchReports()
    }
  }, [eventId, fetchReports])

  return { reports, loading, error, refetch: fetchReports }
}
