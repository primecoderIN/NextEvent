import React from "react"

interface StatCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string | number
  subtext?: React.ReactNode
}

export function StatCard({ icon, iconBg, label, value, subtext }: StatCardProps) {
  return (
    <div className="flex-1 min-w-0 bg-card border border-border/40 rounded-2xl p-4 flex gap-3 items-start">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold tracking-tight leading-none">{value}</p>
        <div className="mt-1 text-xs">{subtext}</div>
      </div>
    </div>
  )
}
