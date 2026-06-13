import { useState } from "react"
import axios, { type AxiosError } from "axios"

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

export function useCreateEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function createEvent(payload: CreateEventPayload): Promise<string | null> {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post<CreateEventResult>(
        "https://localhost:5001/api/events",
        payload
      )
      // Accept both camelCase and PascalCase Id from the API
      const id = res.data.id ?? res.data.Id
      if (!id) {
        setError("Server returned an invalid response. Please try again.")
        return null
      }
      return id
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ title?: string; errors?: Record<string, string[]> }>
      const serverMsg =
        axiosErr.response?.data?.title ??
        (err instanceof Error ? err.message : "Failed to create event")
      console.error("Error creating event:", axiosErr.response?.data ?? err)
      setError(serverMsg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createEvent, loading, error }
}
