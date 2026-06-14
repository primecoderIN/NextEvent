import axios, { type AxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EVENTS_QUERY_KEY } from "@/hooks/useEvents"
import { axiosHttpAgent } from "@/lib/axios"

/** Partial payload — only include fields that changed */
export interface UpdateEventPayload {
  title?: string
  description?: string
  category?: string
  date?: string        // ISO 8601 datetime string
  city?: string
  venue?: string
  isCancelled?: boolean
  latitude?: number
  longitude?: number
}

interface UpdateEventArgs {
  id: string
  data: UpdateEventPayload
}

const putEvent = async ({ id, data }: UpdateEventArgs): Promise<void> => {
  await axiosHttpAgent.put(`/events/${id}`, data)
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  const mutation = useMutation<
    void,
    AxiosError<{ title?: string; errors?: Record<string, string[]> }>,
    UpdateEventArgs
  >({
    mutationFn: putEvent,
    onSuccess: () => {
      // Invalidate only the events list — exact:true prevents this from
      // cascading into ["events", id] (the detail query key used by useEventDetail).
      // The detail page will fetch fresh data naturally when it mounts.
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY, exact: true })
    },
    onError: (err) => {
      console.error("Error updating event:", err.response?.data ?? err)
    },
  })

  /**
   * PUT /api/events/{id}
   * Returns true on success (204), false if not found (404), null on network/other error.
   */
  async function updateEvent(id: string, data: UpdateEventPayload): Promise<boolean | null> {
    try {
      await mutation.mutateAsync({ id, data })
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 404) return false
      return null
    }
  }

  const errorMsg = (() => {
    if (!mutation.error) return null
    const data = mutation.error.response?.data
    if (data?.title) return data.title
    if (mutation.error.response?.status === 404) return "Event not found."
    return mutation.error instanceof Error ? mutation.error.message : "Failed to update event"
  })()

  return { updateEvent, loading: mutation.isPending, error: errorMsg ?? null }
}
