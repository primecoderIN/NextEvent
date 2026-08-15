import { useRouteError } from "react-router-dom"
import { useEffect } from "react"
import { Button } from "./button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export function GlobalErrorBoundary() {
  const error = useRouteError() as any
  const errorMessage = error?.message || error?.statusText || String(error)
  const isChunkError = 
    errorMessage.includes("Failed to fetch dynamically imported module") || 
    errorMessage.includes("Importing a module script failed") ||
    errorMessage.includes("ChunkLoadError")

  useEffect(() => {
    if (isChunkError) {
      const lastReload = sessionStorage.getItem("last-chunk-error-reload")
      const now = Date.now()
      
      // If we haven't reloaded in the last 10 seconds, reload automatically to get the new assets
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem("last-chunk-error-reload", String(now))
        window.location.reload()
      }
    }
  }, [isChunkError])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-bold tracking-tight">
            {isChunkError ? "App Update Available" : "Unexpected Application Error"}
          </h2>
          <p className="mb-6 text-muted-foreground">
            {isChunkError 
              ? "A new version of NextEvent is ready. We are reloading the page to fetch the latest updates." 
              : "Something went wrong while rendering this page. You can try refreshing the page."}
          </p>
          
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reload Application
          </Button>

          {errorMessage && (
            <details className="mt-6 w-full text-left text-xs bg-muted/50 border border-border p-3 rounded-lg text-muted-foreground select-text cursor-pointer">
              <summary className="font-semibold outline-none hover:text-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap font-mono">
                {errorMessage}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
