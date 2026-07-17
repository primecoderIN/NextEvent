import { type AxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EVENTS_QUERY_KEY } from "@/shared/hooks/useEvents"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"

export interface CreateEventPayload {
  organizationId: string
  title: string
  description: string
  categoryId: string
  date: string          // ISO 8601 datetime string
  city: string
  venue: string
  latitude: number
  longitude: number
}

interface CreateEventData {
  id: string
}

const postEvent = async (payload: CreateEventPayload): Promise<string> => {
  const res = await axiosHttpAgent.post<ApiResponse<CreateEventData>>("/events", payload)
  const id = res.data.data?.id
  if (!id) throw new Error(res.data.message || "Server returned an invalid response. Please try again.")
  return id
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, AxiosError<ApiResponse<null>>, CreateEventPayload>({
    mutationFn: postEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY })
    },
    onError: (err) => {
      console.error("Error creating event:", err.response?.data ?? err)
    },
  })

  async function createEvent(payload: CreateEventPayload): Promise<string | null> {
    try {
      return await mutation.mutateAsync(payload)
    } catch {
      return null
    }
  }

  /**
   * Prefer the server's envelope message; fall back to the first validation
   * error value if the message is the generic "Validation failed" string.
   */
  const errorMsg = (() => {
    if (!mutation.error) return null
    const body = mutation.error.response?.data
    if (body) {
      const firstFieldError = Object.values(body.errors ?? {})[0]?.[0]
      return firstFieldError ?? body.message ?? null
    }
    return mutation.error instanceof Error ? mutation.error.message : null
  })()

  return {
    createEvent,
    loading: mutation.isPending,
    error: errorMsg ?? null,
    /** Full server validation errors map, keyed by field name */
    fieldErrors: mutation.error?.response?.data?.errors ?? {},
  }
}
