import axios, { type AxiosError } from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { EVENTS_QUERY_KEY } from "@/hooks/useEvents"

export interface CreateEventPayload {
  title: string
  description: string
  category: string
  date: string          // ISO 8601 datetime string
  city: string
  venue: string
  latitude: number
  longitude: number
}

// API may return camelCase (id) or PascalCase (Id) depending on serializer config
interface CreateEventResult {
  id?: string
  Id?: string
}

const postEvent = async (payload: CreateEventPayload): Promise<string> => {
  const res = await axios.post<CreateEventResult>(
    "https://localhost:5001/api/events",
    payload
  )
  const id = res.data.id ?? res.data.Id
  if (!id) throw new Error("Server returned an invalid response. Please try again.")
  return id
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  const mutation = useMutation<string, AxiosError<{ title?: string; errors?: Record<string, string[]> }>, CreateEventPayload>({
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

  const errorMsg =
    mutation.error?.response?.data?.title ??
    (mutation.error instanceof Error ? mutation.error.message : null)

  return {
    createEvent,
    loading: mutation.isPending,
    error: errorMsg ?? null,
  }
}
