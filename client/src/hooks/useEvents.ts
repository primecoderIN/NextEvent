import { useState, useEffect } from "react"
import axios from "axios"
import type { Event } from "@/Types/Event"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios
      .get<Event[]>("https://localhost:5001/api/events")
      .then((res) => {
        setEvents(res.data)
        setLoading(false)
      })
      .catch((err: unknown) => {
        console.error("Error fetching events:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setLoading(false)
      })
  }, [])

  return { events, loading, error }
}
