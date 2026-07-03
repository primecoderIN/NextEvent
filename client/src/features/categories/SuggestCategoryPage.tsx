import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCreateCategorySchema, type CreateCategoryFormValues } from "@/features/admin/types";
import { useSubmitCategorySuggestion } from "@/hooks/useSubmitCategorySuggestion";
import { useAuth } from "@/features/auth/AuthContext";
import { toast } from "sonner";

export default function SuggestCategoryPage() {
  const { t } = useTranslation(["admin", "common"]);
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return <div className="p-6">{t("notAuthorized", { ns: "common" })}</div>;

  const schema = getCreateCategorySchema(t);
  const { register, handleSubmit, formState: { errors } } = useForm<CreateCategoryFormValues>({ resolver: zodResolver(schema) });
  const { suggestCategory, loading } = useSubmitCategorySuggestion();

  const onSubmit = async (values: CreateCategoryFormValues) => {
    try {
      await suggestCategory({ name: values.name, slug: values.slug, description: values.description });
      toast.success(t("categorySuggested", { ns: "admin" }));
      navigate("/");
    } catch (err) {
      toast.error(String(err));
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("suggestCategory", { ns: "admin" })}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">{t("name", { ns: "admin" })}</label>
          <input {...register("name")} className="mt-1 block w-full" />
          <p className="text-xs text-destructive">{errors.name?.message as any}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">{t("slug", { ns: "admin" })}</label>
          <input {...register("slug")} className="mt-1 block w-full" />
          <p className="text-xs text-destructive">{errors.slug?.message as any}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">{t("description", { ns: "admin" })}</label>
          <textarea {...register("description")} className="mt-1 block w-full" />
          <p className="text-xs text-destructive">{errors.description?.message as any}</p>
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded">
          {loading ? t("submitting") : t("suggest")}
        </button>
      </form>
    </div>
  );
}
