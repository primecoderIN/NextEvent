import { useState } from "react"
import axios, { type AxiosError } from "axios"

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * DELETE /api/events/{id}
   * Returns true on success (204), false if not found (404), null on network error.
   */
  async function deleteEvent(id: string): Promise<boolean | null> {
    setLoading(true)
    setError(null)
    try {
      await axios.delete(`https://localhost:5001/api/events/${id}`)
      return true
    } catch (err: unknown) {
      const axiosErr = err as AxiosError
      if (axiosErr.response?.status === 404) {
        setError("Event not found. It may have already been deleted.")
        return false
      }
      const msg = err instanceof Error ? err.message : "Failed to delete event"
      console.error("Error deleting event:", err)
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { deleteEvent, loading, error }
}
