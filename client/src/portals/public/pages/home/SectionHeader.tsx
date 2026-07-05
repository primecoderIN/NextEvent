import { ChevronRight } from "lucide-react"

interface SectionHeaderProps {
  title: string
  seeAllHref?: string
  onSeeAll?: () => void
}

export function SectionHeader({
  title,
  seeAllHref = "#",
  onSeeAll,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold">{title}</h2>
      <a
        href={seeAllHref}
        onClick={onSeeAll}
        className="text-sm text-primary font-medium hover:underline flex items-center gap-0.5"
      >
        See All <ChevronRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
