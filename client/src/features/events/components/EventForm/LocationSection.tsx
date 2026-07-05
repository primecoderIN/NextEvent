import { useState, useEffect, useRef } from "react"
import { MapPin, Building2, Globe, Search, MapPin as PinIcon, Loader2, X } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Controller, useFormContext } from "react-hook-form"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import type { EventFormValues } from "@/features/events/components/EventForm/types"
import { FieldError, SectionTitle } from "@/features/events/components/EventForm/components"
import { useDebounce } from "@/shared/hooks/useDebounce"

export function LocationSection() {
  const { t } = useTranslation(["createEvent", "common"])
  const { control, setValue, register, formState: { errors } } = useFormContext<EventFormValues>()

  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const debouncedSearch = useDebounce(searchTerm, 400)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const skipNextSearchRef = useRef(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setResults([])
      return
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false
      return
    }

    const fetchResults = async () => {
      setIsSearching(true)
      try {
        const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
        if (!apiKey) {
          console.warn("Geoapify API key is missing")
          return
        }
        
        const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(debouncedSearch)}&format=json&apiKey=${apiKey}`)
        const data = await res.json()
        if (data && data.results) {
          setResults(data.results)
          setShowDropdown(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsSearching(false)
      }
    }

    fetchResults()
  }, [debouncedSearch])

  const handleSelect = (place: any) => {
    if (place.lat) setValue("latitude", String(place.lat), { shouldValidate: true, shouldDirty: true })
    if (place.lon) setValue("longitude", String(place.lon), { shouldValidate: true, shouldDirty: true })
    if (place.city) setValue("city", place.city, { shouldValidate: true, shouldDirty: true })
    
    // For venue, prioritize the name of the place if it exists, otherwise the formatted address
    const venueName = place.name || place.address_line1 || place.formatted
    if (venueName) setValue("venue", venueName, { shouldValidate: true, shouldDirty: true })
    
    skipNextSearchRef.current = true
    setSearchTerm(place.formatted || venueName)
    setShowDropdown(false)
  }

  const handleClear = () => {
    setSearchTerm("")
    setResults([])
    setShowDropdown(false)
    setValue("latitude", "", { shouldValidate: true, shouldDirty: true })
    setValue("longitude", "", { shouldValidate: true, shouldDirty: true })
    setValue("city", "", { shouldValidate: true, shouldDirty: true })
    setValue("venue", "", { shouldValidate: true, shouldDirty: true })
  }

  return (
    <section className="space-y-5">
      <SectionTitle icon={<MapPin className="h-4 w-4" />} title={t("sections.location")} />

      {/* Hidden GPS fields */}
      <input type="hidden" {...register("latitude")} />
      <input type="hidden" {...register("longitude")} />

      <div className="space-y-1.5 mb-6 relative" ref={wrapperRef}>
        <Label className="flex items-center gap-2 text-primary font-medium">
          <Search className="h-4 w-4" />
          Search Location
        </Label>
        
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search for a place, city or venue..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (!showDropdown) setShowDropdown(true)
            }}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true)
            }}
            className="pl-10 py-6 text-base bg-muted/20 border-border/60 transition-colors focus:bg-background shadow-sm"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <ul className="max-h-[300px] overflow-y-auto py-1">
              {results.map((place, idx) => {
                const primaryText = place.name || place.address_line1 || place.city || place.formatted
                const secondaryText = place.address_line2 || place.formatted

                return (
                  <li 
                    key={place.place_id || idx}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border/40 last:border-0"
                    onClick={() => handleSelect(place)}
                  >
                    <div className="mt-0.5 bg-primary/10 p-2 rounded-full shrink-0">
                      <PinIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-foreground truncate">
                        {primaryText}
                      </span>
                      {primaryText !== secondaryText && (
                        <span className="text-sm text-muted-foreground truncate">
                          {secondaryText}
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="event-city">
            {t("fields.city.label")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-city"
                  placeholder={t("fields.city.placeholder")}
                  aria-invalid={!!errors.city}
                  className="pl-10"
                  {...field}
                />
              )}
            />
          </div>
          <FieldError msg={errors.city?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="event-venue">
            {t("fields.venue.label")} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Controller
              name="venue"
              control={control}
              render={({ field }) => (
                <Input
                  id="event-venue"
                  placeholder={t("fields.venue.placeholder")}
                  aria-invalid={!!errors.venue}
                  className="pl-10"
                  {...field}
                />
              )}
            />
          </div>
          <FieldError msg={errors.venue?.message} />
        </div>
      </div>
    </section>
  )
}

