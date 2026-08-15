# Frontend Onboarding Guide

This guide is for developers working on the **NextEvent React SPA** (`client/`). It covers the tech stack, key patterns, and how to add new features.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router v7 (Data Router) |
| Styling | Tailwind CSS v4 |
| UI Primitives | Radix UI (Dialog, Select, Popover) |
| HTTP Client | Axios |
| Data Fetching | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod |
| i18n | react-i18next |
| Theming | next-themes (Dark/Light mode) |
| Icons | Lucide React |

---

## 1. Routing

Routing uses **React Router v7 Data Router** (`createBrowserRouter`). Routes are split by portal:

- `app/(public)/routes.tsx` — Home, Event Detail, Org Profile, Member Profile
- `app/organizer/routes.tsx` — Organizer Dashboard, Create/Edit Event, Roles
- `app/admin/routes.tsx` — Admin Dashboard, Events, Organizations, Categories

All routes are composed in `app/router/` into a single router tree.

### Adding a New Page

1. Create your page component in the relevant portal folder
2. Add its route to the portal's `routes.tsx`
3. Wrap with the appropriate guard if needed (see Authorization below)

---

## 2. Authorization Guards

Three guards live in `src/authorization/`:

```tsx
// Redirects to home if user is not an Admin
<RequireRole role="Admin">
  <AdminPage />
</RequireRole>

// Redirects if activeProfile !== "Organizer"
<RequireProfile profile="Organizer">
  <OrganizerPage />
</RequireProfile>

// Redirects if user lacks the org-scoped permission
<RequirePermission permission="events.create">
  <CreateEventPage />
</RequirePermission>
```

---

## 3. Data Fetching — React Query Hooks

All API calls go through custom hooks in `src/shared/hooks/`. **Never call Axios directly from a component.**

### Query Hook Pattern

```ts
// src/shared/hooks/useEventDetail.ts
export function useEventDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.eventDetail(id),
    queryFn: () => agent.Events.getById(id),
    enabled: !!id,
    retry: false,          // Don't retry on 404
  })
}
```

### Mutation Hook Pattern

```ts
// src/shared/hooks/useSuspendEvent.ts
export function useSuspendEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => agent.Events.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminEvents() })
      toast.success('Event suspended')
    },
  })
}
```

### Important Scoping Rules
- `useEvents` — public events. **Disabled on non-Home pages** to avoid wasteful API calls.
- `useMyOrganization` — **disabled when `activeProfile !== "Organizer"`** to avoid 404 spam.
- `useAdminEvents` — admin context only, no filters applied.

---

## 4. Forms — React Hook Form + Zod

```tsx
const schema = z.object({
  title: z.string().min(1, t('validation.titleRequired')),
  date: z.date(),
})

type FormData = z.infer<typeof schema>

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

### Edit Forms — Diff Pattern
Edit forms (Event, Roles) only send **changed fields** to the API:

```ts
const dirtyValues = Object.fromEntries(
  Object.keys(dirtyFields).map(key => [key, values[key]])
)
await updateEvent(id, dirtyValues)
```

This minimizes payload size and avoids overwriting concurrent changes.

---

## 5. Auth Context

`src/features/auth/context/AuthContext.tsx` provides the global auth state:

```ts
const { user, loading, logout } = useAuth()

// user shape:
// {
//   id, email, token, activeProfile: "Member" | "Organizer",
//   roles: string[], permissions: string[]
// }
```

The Axios agent (`src/shared/lib/agent.ts`) automatically:
- Attaches the JWT `Authorization: Bearer` header on every request
- Intercepts `401` responses and calls `POST /account/refresh-token`
- Retries the original request with the new token

---

## 6. Styling

- Use **Tailwind CSS v4** utility classes directly in JSX
- Base UI components live in `src/shared/ui/` (Button, Dialog, Select, Badge, Input, etc.)
- Use `cn()` from `src/shared/lib/utils.ts` to merge conditional classes:

```ts
import { cn } from '@/shared/lib/utils'

<div className={cn('base-class', isActive && 'active-class', className)} />
```

- Variants are managed with `class-variance-authority` (CVA) inside UI components

---

## 7. Internationalization (i18n)

Translations live in `src/i18n/locales/`. To add a new string:

1. Add the key to each locale JSON file
2. Use `useTranslation()` hook in your component:

```ts
const { t } = useTranslation()
return <p>{t('events.noResults')}</p>
```

Zod schemas that use translation strings must be **created inside the component** (or re-created on language change) so they pick up the updated `t()` function.

---

## 8. Adding a New Feature — Checklist

- [ ] Add the Axios API call to `src/shared/lib/agent.ts`
- [ ] Create a React Query hook in `src/shared/hooks/`
- [ ] Add query keys to `src/shared/constants/queryKeys.ts`
- [ ] Build the UI component in `src/features/{domain}/`
- [ ] Add the route to the relevant portal `routes.tsx`
- [ ] Wrap with the appropriate auth guard
- [ ] Add translation keys to locale files
