import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Plus, Tag, ChevronLeft, ChevronRight } from "lucide-react"

import { useCategories } from "@/shared/hooks/useCategories"
import { Roles } from "@/shared/constants/roles"
import { RequireRole } from "@/authorization"
import { RoutePaths } from "@/shared/constants/routePaths"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table"

export function AdminCategoriesPage() {
  const { t } = useTranslation(["admin", "common"])
  const { data: categories = [], isLoading } = useCategories()

  const [page, setPage] = useState(1)
  const pageSize = 10

  const totalPages = Math.ceil(categories.length / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedCategories = categories.slice(startIndex, startIndex + pageSize)

  return (
    <RequireRole role={Roles.Admin} fallback={<div className="p-6">Not authorized</div>}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("categories", { ns: "admin", defaultValue: "Categories" })}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage event categories
            </p>
          </div>
          <Link
            to={RoutePaths.AdminCategoryNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t("createCategory", { ns: "admin", defaultValue: "Create Category" })}
          </Link>
        </div>

        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className={`transition-opacity duration-150 ${isLoading ? "opacity-60" : "opacity-100"}`}>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-md truncate">
                        {category.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {categories.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + pageSize, categories.length)} of{" "}
                {categories.length} categories
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Simplified pagination display for categories
                  let p = i + 1;
                  if (totalPages > 5 && page > 3) {
                    p = page - 2 + i;
                  }
                  if (p > totalPages) return null;

                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                        page === p
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  )
}
