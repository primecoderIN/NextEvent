import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { getCreateCategorySchema, type CreateCategoryFormValues } from "@/app/admin/types"
import { useCreateCategory } from "@/shared/hooks/useCreateCategory"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Button } from "@/shared/ui/button"

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategoryDialog({ open, onOpenChange }: CreateCategoryDialogProps) {
  const { t } = useTranslation(["admin", "common"])
  const schema = getCreateCategorySchema(t)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(schema),
  })
  
  const { createCategory, loading } = useCreateCategory()
  const [dialogError, setDialogError] = useState<string | null>(null)

  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      setDialogError(null)
      await createCategory({ name: values.name, slug: values.slug, description: values.description })
      toast.success(t("categoryCreated", { ns: "admin" }))
      reset()
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setDialogError(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("createCategory", { ns: "admin" })}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("name", { ns: "admin" })}</label>
            <Input 
              {...register("name")} 
              placeholder="e.g., Technology" 
              disabled={loading}
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">{errors.name.message as string}</p>
            )}
          </div>

          {/* Slug Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("slug", { ns: "admin" })}</label>
            <Input 
              {...register("slug")} 
              placeholder="e.g., technology" 
              disabled={loading}
            />
            {errors.slug && (
              <p className="text-xs text-destructive mt-1">{errors.slug.message as string}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium mb-1.5">{t("description", { ns: "admin" })}</label>
            <Textarea 
              {...register("description")} 
              placeholder="Optional description..." 
              disabled={loading}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-xs text-destructive mt-1">{errors.description.message as string}</p>
            )}
          </div>

          {/* Dialog Error */}
          {dialogError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
              {dialogError}
            </div>
          )}

          {/* Actions */}
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("cancel", { ns: "common" })}
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="gap-2"
            >
              {loading && (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              )}
              {loading ? t("creating") : t("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
