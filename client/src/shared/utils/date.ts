/**
 * Formats a UTC date string into the venue's local timezone.
 * If timeZoneId is invalid or missing, it falls back to the user's browser timezone.
 */
export function formatEventDate(utcDateStr: string, timeZoneId?: string): string {
  if (!utcDateStr) return ""
  
  const date = new Date(utcDateStr)
  
  try {
    return date.toLocaleDateString("en-US", {
      timeZone: timeZoneId || undefined, // undefined falls back to browser local
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  } catch {
    // If timeZoneId is invalid (e.g. outdated browser data), fallback to browser local
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  }
}

export function formatEventTime(utcDateStr: string, timeZoneId?: string): string {
  if (!utcDateStr) return ""
  
  const date = new Date(utcDateStr)
  
  try {
    return date.toLocaleTimeString("en-US", {
      timeZone: timeZoneId || undefined,
      hour: "2-digit",
      minute: "2-digit"
    })
  } catch {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }
}
