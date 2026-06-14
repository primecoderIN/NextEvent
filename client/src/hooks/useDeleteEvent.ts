import { type AxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EVENTS_QUERY_KEY } from "@/hooks/useEvents"
import { axiosHttpAgent } from "@/lib/axios"

const deleteEventRequest = async (id: string): Promise<boolean> => {
  await axiosHttpAgent.delete(`/events/${id}`)
  return true
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  const mutation = useMutation<boolean, AxiosError, string>({
    mutationFn: deleteEventRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
    onError: (err) => {
      console.error("Error deleting event:", err)
    },
  })

  /**
   * DELETE /api/events/{id}
   * Returns true on success (204), false if not found (404), null on network error.
   */
  async function deleteEvent(id: string): Promise<boolean | null> {
    try {
      return await mutation.mutateAsync(id)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 404) return false
      return null
    }
  }

  const errorMsg = (() => {
    if (!mutation.error) return null
    const axiosErr = mutation.error as AxiosError
    if (axiosErr.response?.status === 404) return "Event not found. It may have already been deleted."
    return mutation.error instanceof Error
      ? mutation.error.message
      : "Failed to delete event"
  })()

  return { deleteEvent, loading: mutation.isPending, error: errorMsg }
}
