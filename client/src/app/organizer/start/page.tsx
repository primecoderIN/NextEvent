import { useState } from "react"
import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Building2, ArrowRight, CheckCircle2 } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Button } from "@/shared/ui/button"
import { Label } from "@/shared/ui/label"
import { RoutePaths } from "@/shared/constants/routePaths"
import { useCreateOrganization } from "@/shared/hooks/useCreateOrganization"
import { toast } from "sonner"
import type { CreateOrganizationDto } from "@/types/Organization"

const organizationSchema = z.object({
  name: z.string().min(3, "Organization name must be at least 3 characters").max(160, "Name is too long"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(180, "Slug is too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  websiteUrl: z.string().url("Invalid URL").optional().or(z.literal(""))
})

type FormData = z.infer<typeof organizationSchema>

export function StartOrganizerPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const { mutateAsync: createOrganization, isPending } = useCreateOrganization()
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      contactEmail: "",
      contactPhone: "",
      websiteUrl: ""
    }
  })

  const currentSlug = watch("slug")

  const onSubmit = async (data: FormData) => {
    try {
      // Cast is safe since undefined maps seamlessly for JSON serialization
      await createOrganization(data as CreateOrganizationDto)
      setIsSuccess(true)
    } catch (error: any) {
      if (error.response?.data?.errors) {

        // Backend validation errors
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          toast.error(`Error with ${field}`, {
            description: (messages as string[])[0]
          })
        })
      } else {
        toast.error("Failed to create organization", {
          description: error.response?.data?.message || "An unexpected error occurred."
        })
      }
    }
  }

  if (isSuccess) {
    return (
      <div className="container max-w-2xl mx-auto py-24 px-4 sm:px-6 text-center">
        <div className="bg-card border rounded-3xl shadow-sm p-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Application Submitted!</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            Your organization profile has been created successfully. It is currently pending admin verification. 
            We will notify you once it has been approved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to={RoutePaths.Home}>Return to Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to={RoutePaths.Profile}>View Profile</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Become an Organizer</h1>
        <p className="text-xl text-muted-foreground">
          Create your organization profile to start publishing events and selling tickets.
        </p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm p-6 sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Basic Information</h2>
            
            <div className="grid gap-3">
              <Label htmlFor="name">Organization Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g. Acme Events"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="slug">Profile URL Slug <span className="text-destructive">*</span></Label>
              <Input
                id="slug"
                placeholder="acme-events"
                {...register("slug")}
                aria-invalid={!!errors.slug}
              />
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                Your public profile will be at: <strong className="text-foreground">nextevent.com/org/{currentSlug || "slug"}</strong>
              </p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">About the Organization</Label>
              <Textarea
                id="description"
                placeholder="Tell attendees what kind of events you host..."
                className="min-h-[120px]"
                {...register("description")}
              />
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t">
            <h2 className="text-2xl font-semibold tracking-tight">Public Contact Details</h2>
            <p className="text-sm text-muted-foreground">These will be visible on your public profile page.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-3">
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="hello@acme-events.com"
                  {...register("contactEmail")}
                  aria-invalid={!!errors.contactEmail}
                />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
              </div>

              <div className="grid gap-3">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register("contactPhone")}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="websiteUrl">Website</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://acme-events.com"
                {...register("websiteUrl")}
                aria-invalid={!!errors.websiteUrl}
              />
              {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isPending}>
              {isPending ? "Creating Organization..." : "Complete Setup"}
              {!isPending && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
            <p className="text-sm text-center text-muted-foreground mt-4">
              By continuing, you agree to our Organizer Terms of Service.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
