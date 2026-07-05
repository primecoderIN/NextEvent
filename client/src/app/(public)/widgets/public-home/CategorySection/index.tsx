import { CategoryCarousel } from "@/app/(public)/widgets/common/CategoryCarousel"

interface CategorySectionProps {
  active: string
  onChange: (cat: string) => void
}

/**
 * Wraps the shared CategoryCarousel with a section title,
 * matching the "Popular Categories" heading shown in the design.
 */
export function CategorySection({ active, onChange }: CategorySectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Popular Categories</h2>
      <CategoryCarousel active={active} onChange={onChange} />
    </section>
  )
}
