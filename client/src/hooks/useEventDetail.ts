import { useState, useEffect } from "react"
import axios from "axios"
import type { Event } from "@/Types/Event"

export function useEventDetail(id: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    axios
      .get<Event>(`https://localhost:5001/api/events/${id}`)
      .then((res) => {
        setEvent(res.data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error("Error fetching event:", err)
        setError(err instanceof Error ? err.message : "Event not found")
        setLoading(false)
      })
  }, [id])

  return { event, loading, error }
}
