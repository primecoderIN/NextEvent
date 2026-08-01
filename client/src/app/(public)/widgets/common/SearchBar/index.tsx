import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"
import { AdvancedFilterPopover } from "./AdvancedFilterPopover"

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export function SearchBar({
  placeholder = "Search events, categories...",
  className = "",
}: SearchBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")

  // Sync with URL changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery(searchParams.get("q") || "")
  }, [searchParams])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const newParams = new URLSearchParams(searchParams)
      if (query.trim()) {
        newParams.set("q", query.trim())
      } else {
        newParams.delete("q")
      }
      setSearchParams(newParams)
    }
  }

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all h-10"
        />
      </div>
      <AdvancedFilterPopover />
    </div>
  )
}
