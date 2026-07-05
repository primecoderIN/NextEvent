const categoryColors: Record<string, string> = {
  business: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  music: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  sports: "bg-green-500/10 text-green-600 dark:text-green-400",
  exhibition: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  "food & beverage": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  health: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
}

export function CategoryBadge({ name }: { name: string }) {
  const color = categoryColors[name?.toLowerCase()] ?? "bg-primary/10 text-primary"
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {name}
    </span>
  )
}
