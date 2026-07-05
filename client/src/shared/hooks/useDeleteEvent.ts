import { type AxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EVENTS_QUERY_KEY } from "@/shared/hooks/useEvents"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"

const deleteEventRequest = async (id: string): Promise<void> => {
  await axiosHttpAgent.delete<ApiResponse<null>>(`/events/${id}`)
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, AxiosError<ApiResponse<null>>, string>({
    mutationFn: deleteEventRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
    onError: (err) => {
      console.error("Error deleting event:", err.response?.data ?? err)
    },
  })

  /**
   * DELETE /api/events/{id}
   * Returns true on success (200 with envelope), false if not found (404), null on network error.
   */
  async function deleteEvent(id: string): Promise<boolean | null> {
    try {
      await mutation.mutateAsync(id)
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<ApiResponse<null>>
      if (axiosErr.response?.status === 404) return false
      return null
    }
  }

  const errorMsg = (() => {
    if (!mutation.error) return null
    const body = mutation.error.response?.data
    if (body) return body.message ?? null
    if (mutation.error.response?.status === 404) return "Event not found. It may have already been deleted."
    return mutation.error instanceof Error ? mutation.error.message : "Failed to delete event"
  })()

  return { deleteEvent, loading: mutation.isPending, error: errorMsg }
}
