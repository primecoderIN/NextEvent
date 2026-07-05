import { useState } from "react"
import { axiosHttpAgent } from "@/shared/lib/axios"
import type { ApiResponse } from "@/types/ApiResponse"

interface GenerateDescriptionPayload {
  title: string
  category: string
  city: string
  venue: string
}

const generateDescription = async (
  payload: GenerateDescriptionPayload
): Promise<string> => {
  const res = await axiosHttpAgent.post<ApiResponse<string>>(
    "/ai/generate-description",
    payload
  )
  const description = res.data.data
  if (!description) throw new Error(res.data.message || "Failed to generate description")
  return description
}

export function useGenerateDescription() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generate(payload: GenerateDescriptionPayload): Promise<string | null> {
    setLoading(true)
    setError(null)
    try {
      const result = await generateDescription(payload)
      return result
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate description"
      setError(msg)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { generate, loading, error }
}
