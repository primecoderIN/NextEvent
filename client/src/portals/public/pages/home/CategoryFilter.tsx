import { useTranslation } from "react-i18next"
import { CATEGORIES } from "@/portals/public/pages/home/helpers"

interface CategoryFilterProps {
  active: string
  onChange: (cat: string) => void
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  const { t } = useTranslation("home")

  return (
    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {CATEGORIES.map((cat) => {
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
            <span className="text-xs font-medium whitespace-nowrap">{t(`categories.${cat.id}`)}</span>
          </button>
        )
      })}
    </div>
  )
}
