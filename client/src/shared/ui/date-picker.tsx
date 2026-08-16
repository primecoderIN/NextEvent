"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { cn } from "@/shared/lib/utils"

export function DatePicker({
  value,
  onChange,
  className,
  id,
}: {
  value?: string | Date
  onChange?: (date: string) => void
  className?: string
  id?: string
}) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  React.useEffect(() => {
    if (value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(new Date(value))
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDate(undefined)
    }
  }, [value])

  const handleSelect = (selected?: Date) => {
    setDate(selected)
    if (onChange) {
      // Format as YYYY-MM-DD for URL params
      if (selected) {
        const year = selected.getFullYear()
        const month = String(selected.getMonth() + 1).padStart(2, "0")
        const day = String(selected.getDate()).padStart(2, "0")
        onChange(`${year}-${month}-${day}`)
      } else {
        onChange("")
      }
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal px-3 py-2 h-auto min-h-10",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? date.toLocaleDateString() : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
