import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Filter } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { DatePicker } from "@/shared/ui/date-picker"
import { Label } from "@/shared/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

export function AdvancedFilterPopover() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)

  // Local state for the popover inputs
  const [city, setCity] = useState(searchParams.get("city") || "")
  const [dateFrom, setDateFrom] = useState(searchParams.get("dateFrom") || "")
  const [dateTo, setDateTo] = useState(searchParams.get("dateTo") || "")

  // Sync with URL changes (e.g. back button)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCity(searchParams.get("city") || "")
    setDateFrom(searchParams.get("dateFrom") || "")
    setDateTo(searchParams.get("dateTo") || "")
  }, [searchParams])

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams)
    
    if (city.trim()) newParams.set("city", city.trim())
    else newParams.delete("city")

    if (dateFrom) newParams.set("dateFrom", dateFrom)
    else newParams.delete("dateFrom")

    if (dateTo) newParams.set("dateTo", dateTo)
    else newParams.delete("dateTo")

    setSearchParams(newParams)
    setOpen(false)
  }

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("city")
    newParams.delete("dateFrom")
    newParams.delete("dateTo")
    setSearchParams(newParams)
    setCity("")
    setDateFrom("")
    setDateTo("")
    setOpen(false)
  }

  const hasActiveFilters = !!(searchParams.get("city") || searchParams.get("dateFrom") || searchParams.get("dateTo"))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={hasActiveFilters ? "default" : "outline"} size="icon" className="shrink-0 rounded-xl h-10 w-10">
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Advanced Filters</h4>
            <p className="text-sm text-muted-foreground">
              Narrow down events by location and date.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input 
                id="city" 
                placeholder="e.g. New York, London" 
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="dateFrom">From</Label>
                <DatePicker
                  id="dateFrom"
                  value={dateFrom}
                  onChange={setDateFrom}
                />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="dateTo">To</Label>
                <DatePicker
                  id="dateTo"
                  value={dateTo}
                  onChange={setDateTo}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-2">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
            <Button size="sm" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
