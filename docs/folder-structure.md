# Project Folder Structure

Complete directory tree for the NextEvent platform with explanations.

---

## Backend — ASP.NET Core Solution

```
NextEvent/
│
├── API/                                    # Composition Root — ASP.NET Core Web API host
│   ├── Extensions/
│   │   ├── ApiServiceExtensions.cs         # CurrentUserService, CORS, Rate Limiting
│   │   ├── ApplicationServiceExtensions.cs # MediatR + FluentValidation (multi-assembly scan)
│   │   ├── DatabaseServiceExtensions.cs    # DbContexts, Dapper, auto-migration on startup
│   │   ├── IdentityServiceExtensions.cs    # ASP.NET Identity, JWT Bearer, ActiveOrganizer policy
│   │   ├── MassTransitServiceExtensions.cs # MassTransit + Transactional Outbox per DbContext
│   │   └── SwaggerServiceExtensions.cs     # SwaggerGen + XML doc comment scanning
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs          # Maps domain exceptions → ApiResponse<T> envelope
│   ├── Services/
│   │   └── CurrentUserService.cs           # Reads UserId, OrgId, ActiveProfile from JWT claims
│   └── Program.cs                          # Entry point, middleware pipeline configuration
│
├── Modules/                                # Isolated business modules (no direct C# cross-references)
│   │
│   ├── Events/                             # Events module — SQL schema: evt
│   │   ├── API/
│   │   │   ├── EventsController.cs         # Events CRUD + suspend/unsuspend/report endpoints
│   │   │   └── CategoriesController.cs     # Categories + suggestions endpoints
│   │   ├── Application/
│   │   │   ├── Events/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateEvent/        # CreateEventCommand + Handler + Validator
│   │   │   │   │   ├── EditEvent/          # EditEventCommand + Handler + Validator
│   │   │   │   │   ├── DeleteEvent/        # DeleteEventCommand + Handler
│   │   │   │   │   ├── SuspendEvent/       # SuspendEventCommand + Handler (Admin only)
│   │   │   │   │   ├── UnsuspendEvent/     # UnsuspendEventCommand + Handler (Admin only)
│   │   │   │   │   └── ReportEvent/        # ReportEventCommand + Handler (Members only)
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetEventsList/      # Public events — filters suspended + cancelled
│   │   │   │   │   ├── GetMyEventsList/    # Organizer events — scoped to their org
│   │   │   │   │   ├── GetAdminEventsList/ # All events — no filters (Admin only)
│   │   │   │   │   ├── GetEventDetailsById/# Single event; throws 404 for suspended if unauthorized
│   │   │   │   │   ├── GetEventReports/    # Reports for an event (Admin only)
│   │   │   │   │   └── EventQueryBuilder.cs# Shared Dapper SQL builder with filters
│   │   │   │   ├── DTOs/                   # EventResponseDto, CreateEventDto, UpdateEventDto, etc.
│   │   │   │   └── Constants/              # ValidationErrors.cs — stable error codes for i18n
│   │   │   └── Categories/
│   │   │       ├── Commands/               # CreateCategory, SuggestCategory, ApproveCategory, RejectCategory
│   │   │       └── Queries/                # GetCategories, GetCategorySuggestions
│   │   ├── Domain/
│   │   │   ├── Event.cs                    # Event entity with PATCH-style update methods
│   │   │   ├── Category.cs
│   │   │   ├── CategorySuggestion.cs
│   │   │   ├── CategorySuggestionStatus.cs # Enum: Pending=0, Approved=1, Rejected=2
│   │   │   └── EventReport.cs              # Report entity: EventId, ReportedById, Reason
│   │   └── Persistence/
│   │       ├── EventsDbContext.cs           # EF Core context scoped to evt schema
│   │       ├── Configurations/              # Fluent API configurations + unique indexes
│   │       ├── Migrations/                  # EF Core migrations for Events module
│   │       └── Seeders/                     # Category + event seed data
│   │
│   ├── Organizations/                      # Organizations module — SQL schema: org
│   │   ├── API/
│   │   │   ├── OrganizationsController.cs  # Org CRUD, approval, members, invitations
│   │   │   ├── OrganizationRolesController.cs # Custom RBAC role management
│   │   │   └── PermissionsController.cs    # Permissions catalogue endpoint
│   │   ├── Application/
│   │   │   ├── Organizations/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateOrganization/
│   │   │   │   │   ├── ApproveOrganization/
│   │   │   │   │   ├── InviteOrganizationMember/
│   │   │   │   │   ├── AcceptOrganizationInvitation/
│   │   │   │   │   ├── CreateOrganizationRole/
│   │   │   │   │   ├── UpdateOrganizationRole/
│   │   │   │   │   └── UpdateOrganizationMemberRoles/
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetOrganizationsList/   # Admin: all orgs
│   │   │   │   │   ├── GetOrganizationById/    # Auth: by ID
│   │   │   │   │   ├── GetOrganizationBySlug/  # Public: by slug + upcoming events
│   │   │   │   │   ├── GetMyOrganization/      # Organizer: their org
│   │   │   │   │   ├── GetOrganizationMembers/
│   │   │   │   │   ├── GetOrganizationRoles/
│   │   │   │   │   └── GetMyInvitations/
│   │   │   │   ├── Services/
│   │   │   │   │   ├── OrganizationAuthorizationService.cs  # BOLA-safe permission checks
│   │   │   │   │   └── OrganizationMemberService.cs         # Single-org policy enforcement
│   │   │   │   └── DTOs/
│   │   │   └── Permissions/
│   │   │       └── Queries/GetPermissions/
│   │   ├── Domain/                          # Organization, OrganizationMember, OrganizationRole, Permission
│   │   └── Persistence/
│   │       ├── OrganizationsDbContext.cs
│   │       ├── Configurations/
│   │       ├── Migrations/
│   │       └── Seeders/                     # Seeds 5 default system roles + permissions per org
│   │
│   ├── Identity/                           # Identity module — SQL schema: identity
│   │   ├── API/
│   │   │   └── AccountController.cs        # Register, Login, RefreshToken, Logout, SwitchProfile
│   │   ├── Application/
│   │   │   └── Authentication/
│   │   │       ├── Commands/               # Login, Register, RefreshToken, Logout, SwitchProfile
│   │   │       ├── Interfaces/             # ITokenService
│   │   │       └── DTOs/                   # LoginResponseDto, RegisterResponseDto
│   │   ├── Domain/
│   │   │   └── User.cs                     # ApplicationUser: adds ActiveProfile, RefreshToken to IdentityUser
│   │   └── Persistence/
│   │       ├── IdentityDbContext.cs
│   │       ├── Configurations/
│   │       ├── Migrations/
│   │       └── Seeders/                    # Seeds Admin user + role on startup
│   │
│   └── AI/                                # AI module — Gemini Pro integration
│       ├── API/
│       │   └── AiEventDescriptionController.cs
│       └── Application/
│           └── GenerateEventDescription/   # Command + Handler (calls Gemini Pro API)
│
└── Shared/                                # Cross-cutting library (no business logic)
    ├── Behaviors/
    │   └── ValidationBehavior.cs           # MediatR pipeline: runs FluentValidation before handlers
    ├── Common/
    │   └── ApiResponse.cs                  # { success, message, data, errors } envelope
    ├── Constants/
    │   ├── ApiRouteConstants.cs            # Centralized route strings
    │   ├── PermissionConstants.cs          # "events.create", "roles.manage", "members.invite"
    │   └── RoleConstants.cs                # "Admin", "Organizer"
    ├── Controllers/
    │   └── BaseApiController.cs            # OkResponse<T>, CreatedResponse<T> helpers
    ├── Exceptions/
    │   ├── NotFoundException.cs            # → HTTP 404
    │   ├── BusinessRuleException.cs        # → HTTP 409
    │   └── UnauthorizedException.cs        # → HTTP 401
    ├── Interfaces/
    │   ├── ICurrentUserService.cs          # UserId, OrganizationId, ActiveProfile from JWT
    │   ├── IOrganizationAuthorizationService.cs  # BOLA-safe permission verification
    │   └── ISqlConnectionFactory.cs        # Dapper connection factory
    ├── Pagination/
    │   ├── PagedList.cs                    # Generic paged response: Items + TotalCount + metadata
    │   └── PaginationParams.cs             # PageNumber + PageSize query params
    └── Persistence/
        ├── UtcDateTimeHandler.cs           # Dapper: forces DateTimeKind.Utc on all DateTime reads
        └── SqlConnectionFactory.cs         # Creates IDbConnection from connection string
```

---

## Frontend — React SPA (`client/src/`)

```
client/src/
│
├── app/                                   # App shell — layouts, portals, router
│   ├── (public)/                          # Public portal — accessible to guests and members
│   │   ├── layout.tsx                     # PublicLayout: sidebar, navbar; fetches events only on Home
│   │   ├── routes.tsx                     # Public route definitions
│   │   ├── home/                          # Home page: category filter, carousel, event strips
│   │   ├── event-detail/                  # Event detail page (returns 404 for suspended events)
│   │   ├── organizations/                 # Public org profile page (by slug)
│   │   ├── profile/                       # Member profile page
│   │   ├── layouts/                       # Navbar, DesktopSidebar, RightSidebar components
│   │   └── widgets/                       # Reusable page-level widgets (category bar, etc.)
│   │
│   ├── organizer/                         # Organizer portal (ActiveOrganizer profile required)
│   │   ├── layout.tsx                     # OrganizerLayout: sidebar, org context
│   │   ├── routes.tsx                     # Organizer route definitions + RequireProfile guard
│   │   ├── dashboard/                     # Overview stats
│   │   ├── create-event/                  # New event form (location autocomplete + AI description)
│   │   ├── update-event/                  # Edit event form (sends diff payload only)
│   │   ├── events/                        # Organizer's event list + management actions
│   │   ├── roles/                         # Custom RBAC role builder with permissions
│   │   ├── organizations/                 # Org settings (description, contact info, etc.)
│   │   └── start/                         # Onboarding for new organizers without an org
│   │
│   ├── admin/                             # Admin portal (Admin role required)
│   │   ├── layout.tsx                     # AdminLayout: sidebar, admin context
│   │   ├── routes.tsx                     # Admin route definitions + RequireRole guard
│   │   ├── dashboard/                     # Platform-wide analytics
│   │   ├── events/                        # All events: suspend/unsuspend + view reports
│   │   ├── organizations/                 # Org approval queue
│   │   └── categories/                    # Category management + suggestion review
│   │
│   ├── layout/                            # Root providers: QueryClientProvider, AuthContext, ThemeProvider
│   ├── not-found/                         # Global 404 page
│   └── router/                            # createBrowserRouter — composes all portal routes
│
├── authorization/                         # Route & component-level guards
│   ├── RequireRole.tsx                    # Redirects if user lacks platform role (e.g. "Admin")
│   ├── RequireProfile.tsx                 # Redirects if activeProfile doesn't match ("Organizer")
│   └── RequirePermission.tsx              # Redirects if user lacks org permission ("events.create")
│
├── features/                              # Feature-scoped components (domain UI)
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── context/AuthContext.tsx        # Global auth state (user, loading, logout)
│   ├── events/
│   │   ├── components/EventCard/
│   │   ├── components/EventTable/         # Admin/Organizer event table with actions
│   │   └── components/EventDetailView/
│   └── organizations/
│       ├── components/OrganizationTable/  # Admin org table
│       └── components/OrganizationDetailsView/
│
├── shared/
│   ├── hooks/                             # 26 React Query hooks — one per API concern
│   │   ├── useEvents.ts                   # Public events (enabled only on Home page)
│   │   ├── useMyEvents.ts                 # Organizer events
│   │   ├── useAdminEvents.ts              # All events for admin
│   │   ├── useEventDetail.ts              # Single event (retry: false for 404s)
│   │   ├── useSuspendEvent.ts             # Admin suspend mutation
│   │   ├── useUnsuspendEvent.ts           # Admin unsuspend mutation
│   │   ├── useReportEvent.ts              # Member report mutation
│   │   ├── useEventReports.ts             # Admin view reports
│   │   ├── useMyOrganization.ts           # Organizer's org (disabled for non-organizers)
│   │   ├── useOrganizationMembers.ts      # Members list + role mutation hooks
│   │   └── ...                            # useCategories, useCreateEvent, useUpdateEvent, etc.
│   ├── ui/                                # Base UI components (Button, Dialog, Select, Badge, Input...)
│   ├── constants/
│   │   ├── routePaths.ts                  # Centralized route path strings
│   │   ├── apiRoutes.ts                   # API endpoint path strings
│   │   └── queryKeys.ts                   # React Query cache key factories
│   └── lib/
│       └── utils.ts                       # cn() — clsx + tailwind-merge utility
│
├── i18n/                                  # Internationalization
│   ├── index.ts                           # i18next setup (HTTP backend, language detection)
│   └── locales/                           # Translation JSON files per language
│
└── types/                                 # Global TypeScript types
    ├── api.ts                             # ApiResponse<T>, PagedList<T> envelope types
    └── models.ts                          # Event, Organization, User, Category DTOs
```
