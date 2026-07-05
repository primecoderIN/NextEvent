import { useState, useEffect, useRef } from "react"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"

const DEBOUNCE_MS = 700
const MIN_TITLE_LENGTH = 3

const suggestCategory = async (title: string): Promise<string> => {
  const res = await axiosHttpAgent.post<ApiResponse<string>>(
    "/ai/suggest-category",
    { title }
  )
  return res.data.data ?? ""
}

/**
 * Debounced category suggestion hook.
 * Fires a POST to /api/ai/suggest-category whenever `title` changes,
 * with a 700ms debounce to avoid hammering the API on every keystroke.
 */
export function useSuggestCategory(title: string) {
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Clear suggestion immediately when title is too short
    if (title.trim().length < MIN_TITLE_LENGTH) {
      setSuggestion(null)
      return
    }

    const timer = setTimeout(async () => {
      // Cancel any in-flight previous request
      abortRef.current?.abort()
      abortRef.current = new AbortController()

      setLoading(true)
      try {
        const result = await suggestCategory(title)
        setSuggestion(result || null)
      } catch {
        // Fail silently — category suggestion is non-critical
        setSuggestion(null)
      } finally {
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [title])

  function clearSuggestion() {
    setSuggestion(null)
  }

  return { suggestion, loading, clearSuggestion }
}
