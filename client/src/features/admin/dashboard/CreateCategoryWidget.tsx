import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { getCreateCategorySchema, type CreateCategoryFormValues } from "@/features/admin/types"
import { useCreateCategory } from "@/hooks/useCreateCategory"

export function CreateCategoryWidget() {
  const { t } = useTranslation(["admin", "common"])
  const schema = getCreateCategorySchema(t as any)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(schema),
  })
  const { createCategory, loading: creating } = useCreateCategory()

  const onCreateCategory = async (values: CreateCategoryFormValues) => {
    try {
      await createCategory({ name: values.name, slug: values.slug, description: values.description })
      toast.success("Category created successfully")
      reset()
    } catch {
      toast.error("Failed to create category")
    }
  }

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-4">
      <h2 className="text-sm font-bold mb-4">Create Category</h2>
      <form onSubmit={handleSubmit(onCreateCategory)} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Category Name
          </label>
          <input
            {...register("name")}
            placeholder="Enter category name"
            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Description <span className="text-muted-foreground/60">(Optional)</span>
          </label>
          <input
            {...register("description")}
            placeholder="Enter description"
            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Slug
          </label>
          <input
            {...register("slug")}
            placeholder="e.g. tech-conference"
            className="w-full px-3 py-2 text-sm bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.slug && (
            <p className="text-xs text-destructive mt-1">{errors.slug.message as string}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
        >
          <Plus className="h-4 w-4" />
          {creating ? "Creating…" : "Create Category"}
        </button>
      </form>
    </div>
  )
}
