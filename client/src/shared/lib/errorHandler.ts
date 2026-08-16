/**
 * Sets up global error handlers to catch unhandled errors and promise rejections
 * that aren't caught by React's error boundary.
 */
export function setupGlobalErrorHandlers() {
  // Handle uncaught promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // Prevent the default browser behavior (logging to console)
    event.preventDefault()
    // Navigate to error page
    navigateToErrorPage(event.reason)
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // For errors in scripts, navigate to error page
    if (event.error) {
      navigateToErrorPage(event.error)
    }
  })
}

/**
 * Navigate to error page by reloading with error state
 */
function navigateToErrorPage(error: any) {
  const errorMessage = error?.message || String(error)
  sessionStorage.setItem('app-error', errorMessage)
  window.location.href = '/error'
}
