import { useTranslation } from "react-i18next"
import { useCategories } from "@/shared/hooks/useCategories"
import {
  LayoutGrid,
  Music,
  Wine,
  GraduationCap,
  Dumbbell,
  Briefcase,
  Tag
} from "lucide-react"

interface CategoryCarouselProps {
  active: string
  onChange: (cat: string) => void
}

const iconMap: Record<string, any> = {
  music: Music,
  nightlife: Wine,
  workshop: GraduationCap,
  workshops: GraduationCap,
  sports: Dumbbell,
  business: Briefcase,
}

export function CategoryCarousel({ active, onChange }: CategoryCarouselProps) {
  const { t } = useTranslation("home")
  const { data: apiCategories, isLoading } = useCategories()

  if (isLoading) {
    return <div className="h-20 flex items-center justify-center animate-pulse bg-muted rounded-2xl w-full" />
  }

  // Combine "All" category with API categories
  const categories = [
    { id: "all", name: t("categories.all"), icon: LayoutGrid },
    ...(apiCategories?.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: iconMap[cat.slug?.toLowerCase()] || Tag
    })) || [])
  ]

  return (
    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {categories.map((cat) => {
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl transition-all duration-200 ${
              isActive
                ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <cat.icon className="h-5 w-5" />
            <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
