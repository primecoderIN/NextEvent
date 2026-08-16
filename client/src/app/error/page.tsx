import { useEffect } from "react"
import { ErrorUI } from "@/shared/ui/GlobalErrorBoundary"

export function ErrorPage() {
  const errorMessage = sessionStorage.getItem('app-error') || undefined

  useEffect(() => {
    // Clear the error from session storage
    sessionStorage.removeItem('app-error')
  }, [])

  return (
    <ErrorUI 
      title="Unexpected Application Error"
      message="Something went wrong. We apologize for the inconvenience. Please try refreshing the page."
      errorDetails={errorMessage || undefined}
    />
  )
}
