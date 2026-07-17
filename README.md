# NextEvent

A full-stack event discovery and management platform. Browse upcoming events, view detailed event pages, create new events, and manage them — all in a clean, modern interface.

---

## Tech Stack

### Backend — ASP.NET Core Web API
| Layer | Technology |
|---|---|
| API | ASP.NET Core 10 |
| Architecture | Clean Architecture — Domain / Application / Persistence / API |
| CQRS | MediatR |
| Validation | FluentValidation + MediatR pipeline behavior |
| ORM | Entity Framework Core |
| Database | SQL Server (`NextEventDb`) |
| Serialisation | `System.Text.Json` with camelCase naming policy |
| URL style | Lowercase route generation |

### Frontend — React SPA
| Concern | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (Dialog, Select, Slot) |
| Component system | shadcn-style components (hand-rolled) |
| HTTP client | Axios |
| Icons | Lucide React |
| Variant styles | class-variance-authority + clsx + tailwind-merge |

### Key Design Decisions

- **DateTimeOffset over DateTime**  
  We strictly use `DateTimeOffset` across the entire solution. This architectural decision provides several critical benefits:
  - **Timezone Safety**: Exact points in time are unambiguous, explicitly storing the offset from UTC.
  - **Native SQL Mapping**: It natively maps to EF Core's `datetimeoffset` column type without the overhead of custom string value converters.
  - **Improved Database Indexing**: By storing as native `datetimeoffset` rather than strings, SQL Server can build more efficient indexes and perform faster range queries (e.g. finding upcoming events).
  - **Seamless Serialization**: Generates standard ISO-8601 strings during `System.Text.Json` serialization (e.g., `+00:00`), which the frontend JavaScript `Date` object parses natively without needing custom date converters on the backend or parsing logic on the frontend.

- **Tenant-Specific RBAC**  
  Unlike ASP.NET Identity roles which are platform-wide (e.g., a user is an "Admin" everywhere), we implemented a custom Organization RBAC model. Users hold `OrganizationRoles` tied specifically to an `OrganizationId`, composed of granular `Permissions` (like `events.create`). This isolates authorization boundaries, preventing role-bleeding across different organizations the user might belong to.

---

## Project Structure

```
NextEvent/
├── API/                        # ASP.NET Core Web API host
│   ├── Common/
│   │   └── ApiResponse.cs      # Generic response envelope + static factory
│   ├── Controllers/
│   │   ├── AccountController.cs  # Auth endpoints
│   │   ├── AiController.cs       # AI integration endpoints
│   │   ├── BaseApiController.cs  # OkResponse<T> / CreatedResponse<T> helpers
│   │   └── EventsController.cs   # Events CRUD endpoints
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs  # Centralised exception → ApiResponse mapping
│   ├── Program.cs              # DI setup, middleware, DB migration on startup
│
├── Application/                # Business logic (CQRS with MediatR)
│   ├── Authentication/         # Auth feature folders
│   │   ├── Commands/
│   │   ├── DTOs/
│   │   └── Interfaces/
│   ├── Core/
│   │   ├── Exceptions/
│   │   │   ├── NotFoundException.cs       # → HTTP 404
│   │   │   └── BusinessRuleException.cs   # → HTTP 409
│   │   ├── Interfaces/
│   │   │   └── IAppDBContext.cs           # Dependency Inversion for EF Core
│   │   └── ValidationBehavior.cs          # MediatR pipeline: runs FluentValidation
│   └── Events/                 # Event feature folders
│       ├── Commands/
│       │   ├── CreateEvent/
│       │   ├── DeleteEvent/
│       │   └── EditEvent/
│       ├── Constants/
│       │   └── ValidationErrors.cs        # Centralised validation error codes
│       ├── DTOs/
│       └── Queries/
│           ├── GetEventDetailsById/
│           └── GetEventsList/
│
├── Domain/                     # Core domain entity
│   ├── Event.cs                # Event entity with PATCH-friendly update methods (Guid PK)
│   └── User.cs                 # ASP.NET Core Identity user entity
│
├── Persistence/                # EF Core DbContext + data seeding
│   ├── AppDBContext.cs         # Implements IAppDBContext
│   └── DBInitializer.cs        # Seeds initial Events and Roles
│
└── client/                     # React frontend (Vite)
    └── src/
        ├── app/                # App-level configurations and routing portals
        │   ├── (public)/       # Public routes and views (Home, Event Details)
        │   ├── admin/          # Admin portal routes and dashboard
        │   ├── organizer/      # Organizer portal routes and tools
        │   ├── layout/         # Root layout providers and shells
        │   └── router/         # Centralized React Router v6 Data Router configuration
        ├── authorization/      # Auth logic, route guards, and session management
        ├── features/           # Feature-sliced domain modules (auth, events, categories...)
        ├── i18n/               # Internationalization setup and translation files
        ├── shared/             # Reusable layer decoupled from specific features
        │   ├── constants/      # App-wide constants
        │   ├── hooks/          # Reusable custom React hooks
        │   ├── lib/            # Utility functions (e.g., tailwind merge helpers)
        │   └── ui/             # Base UI components (Radix/shadcn-style wrappers)
        └── types/              # Global TypeScript types
```

---

## Architecture Guide

This section explains the core architectural decisions made in the NextEvent platform, covering both the **Backend** (ASP.NET Core Web API) and **Frontend** (React SPA). It is designed to answer the "Why" and "How" for developers working on the codebase.

### 1. Backend Architecture (ASP.NET Core)

The backend is structured using **Clean Architecture** combined with the **CQRS (Command Query Responsibility Segregation)** pattern.

* **1.1 Clean Architecture Layers & Dependency Flow**
  The core principle of Clean Architecture is **Dependency Inversion**: the inner layers (containing business rules) must never depend on outer layers (containing infrastructure, frameworks, or databases). Source code dependencies can only point *inward*.
  * **Domain (`Domain`)**: At the absolute center of the application. It contains the core business entities (e.g., `Event`, `User`), value objects, and domain logic. It has zero dependencies on other projects. This ensures business entities remain pure and untied to specific database technologies (like EF Core), allowing raw business rules to be tested instantly without mocking a database.
  * **Application (`Application`)**: Contains the business use cases (Commands and Queries) and defines the interfaces for external services (e.g., `IAppDBContext`). It depends only on the Domain layer. The Application layer defines *what* happens without caring *how* data is saved (SQL vs NoSQL) or requested (HTTP vs gRPC).
  * **Persistence (`Persistence`)**: The infrastructure layer responsible for data access. It implements the interfaces defined by the Application layer (e.g., `AppDBContext` implements `IAppDBContext`). It depends on the Application layer. This decoupling means swapping from SQL Server to PostgreSQL only requires changing this layer.
  * **API (`API`)**: The presentation layer. It acts as the "Composition Root" in `Program.cs`, wiring up the Dependency Injection (DI) container. It depends on the Application and Persistence layers to dispatch HTTP requests via MediatR and register the DB context.

* **1.2 CQRS with MediatR**
  Instead of traditional fat controllers or sprawling service classes, we use **CQRS** implemented via **MediatR**.
  * **Commands**: Actions that mutate state (e.g., `CreateEventCommand`, `DeleteEventCommand`).
  * **Queries**: Actions that retrieve state without mutating it (e.g., `GetEventsListQuery`).
  * **Why:** Each handler has exactly one reason to change (Single Responsibility). Code is organized by feature rather than technical concern. Cross-cutting concerns are handled via MediatR pipeline behaviors.

* **1.3 Validation Pipeline Behavior**
  We use **FluentValidation** to validate requests. However, validators are *never* explicitly invoked inside the handlers.
  * **How:** An open generic MediatR `ValidationBehavior<TRequest, TResponse>` intercepts requests before they reach the handler. If validation fails, it throws a `ValidationException`.
  * **Why:** Handlers remain pure. They assume the data is valid by the time it reaches them.

* **1.4 Global Exception Handling (ExceptionMiddleware)**
  The API uses a custom middleware (`ExceptionMiddleware.cs`) that wraps the entire HTTP pipeline in a `try/catch` block.
  * **How:** It catches domain exceptions like `ValidationException`, `NotFoundException`, and `BusinessRuleException` and maps them to appropriate HTTP status codes (`400`, `404`, `409`) with a standardized JSON response envelope (`ApiResponse<T>`).
  * **Why:** Controllers do not need to contain `try/catch` blocks or return `BadRequest()` manually.

* **1.5 Explicit Routing & Controller Base**
  Controllers inherit from `BaseApiController`, but routing is explicitly defined on each class (e.g., `[Route("api/events")]`).
  * **Why:** Implicit routing based on class names is brittle. Explicit routing ensures URLs are decoupled from C# class names, preventing silent contract breaks when refactoring.

* **1.6 Entity Framework & Guid Primary Keys**
  The `Event` entity uses a `Guid` as its primary key (`Id`).
  * **Why:** `Guid` is natively supported by most databases, allows the Application layer to generate IDs *before* saving, and prevents predictability (unlike integers).

### 2. Frontend Architecture (React SPA)

The frontend is a Single Page Application (SPA) built for performance, modularity, and modern aesthetics.

* **2.1 Core Framework (React 19 + Vite)**
  * **React 19**: Used for building the UI component tree.
  * **Vite**: Replaces Create React App/Webpack. It uses native ES modules for near-instant dev server startup and extremely fast Hot Module Replacement (HMR).

* **2.2 Routing (React Router v7 Data Router)**
  We use the **React Router v7 Data Router** (`createBrowserRouter`) to manage client-side navigation. 
  * **Decentralized Configuration:** Routing is implemented using a **Feature-Sliced Design (FSD)** approach. Each portal (`admin`, `organizer`, `public`) owns its specific `routes.tsx` configuration array. The global router securely composes the top-level route tree.
  * **Why:** The object-based Data Router unlocks advanced features like parallel data loading, actions, and strict error boundary isolation.

* **2.3 Styling Strategy (Tailwind CSS v4 + Radix UI)**
  The project eschews heavy component libraries in favor of a **hand-rolled, utility-first** approach.
  * **Tailwind CSS**: Utility classes allow for rapid styling directly in the markup.
  * **Radix UI**: Provides unstyled, accessible primitives (Dialogs, Selects, Popovers) handling complex ARIA attributes and focus management.
  * **shadcn-style Architecture**: The `components/ui/` folder contains reusable components that wrap Radix primitives with Tailwind classes.
  * **Why:** Maximum customizability. We own the component code entirely without fighting a vendor library's internal CSS specificity.

* **2.4 State Management & Data Fetching (React Query)**
  **TanStack React Query** is the primary driver for fetching, caching, and updating asynchronous data from the API.
  * **Why:** It abstract away race conditions, manual caching, and loading/error state management inherent in traditional `useEffect` fetching.
  * **Note on isolation:** Data fetching hooks are strictly isolated by bounded context (e.g., `useEvents` for public, `useMyEvents` for organizers, `useAdminEvents` for admins). This prevents data leakage and ensures clean frontend components that don't juggle roles.

* **2.5 Form Handling (React Hook Form + Zod)**
  Forms are managed using **React Hook Form** coupled with **Zod** schema validation.
  * **Why:** React Hook Form minimizes re-renders, while Zod provides strict TypeScript type-safety ensuring form data matches the expected API shape.

* **2.6 Localization (i18next)**
  The client uses `react-i18next` for internationalization.
  * **Why:** Allows dynamic UI translation via HTTP backend loading and automatic browser language detection.

---

## API Response Envelope

Every endpoint returns the same JSON shape regardless of outcome:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { ... },
  "errors": {}
}
```

| Field | Type | Description |
|---|---|---|
| `success` | `bool` | `true` for 2xx responses, `false` for all errors |
| `message` | `string` | Human-readable summary |
| `data` | `T \| null` | Response payload (null on error) |
| `errors` | `{ [field]: string[] }` | Validation errors keyed by property name |

### Error HTTP Status Codes

| Exception | HTTP Status | Scenario |
|---|---|---|
| `ValidationException` | `400 Bad Request` | FluentValidation failures |
| `NotFoundException` | `404 Not Found` | Resource does not exist |
| `BusinessRuleException` | `409 Conflict` | Domain rule violated |
| Unhandled `Exception` | `500 Internal Server Error` | Unexpected server error |

---

## API Endpoints

Base URL: `https://localhost:5001/api`

| Method | Endpoint | Status | Description |
|---|---|---|---|
| `GET` | `/events` | `200 OK` | List public active events (IsCancelled = 0) |
| `GET` | `/events/my` | `200 OK` | List events for current organizer (Organizer only) |
| `GET` | `/events/admin` | `200 OK` | List all events across the platform (Admin only) |
| `GET` | `/events/{id}` | `200 OK` | Get event by ID |
| `POST` | `/events` | `201 Created` | Create a new event |
| `PUT` | `/events/{id}` | `200 OK` | Edit an existing event (partial update supported) |
| `DELETE` | `/events/{id}` | `200 OK` | Delete an event |

### Organizations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/organizations` | Create a new organization (seeds default roles) |
| `GET` | `/organizations/{id}` | Get organization details by ID |
| `GET` | `/organizations/{slug}` | Get public organization profile + upcoming events (AllowAnonymous) |
| `POST` | `/organizations/{id}/approve` | Approve a pending organization (Admin only) |
| `POST` | `/organizations/{id}/roles` | Create a custom organization role |
| `PUT` | `/organizations/{id}/roles/{roleId}` | Update an organization role (name, description, permissions) |

### Permissions
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/permissions` | Get catalogue of system permissions available for roles |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | Get all categories |
| `POST` | `/categories` | Create a new category (Admin only) |
| `GET` | `/categories/suggestions` | Get category suggestions (Admin only) |
| `POST` | `/categories/suggest` | Suggest a new category (Authenticated users) |
| `POST` | `/categories/{id}/approve` | Approve a category suggestion (Admin only) |
| `POST` | `/categories/{id}/reject` | Reject a category suggestion (Admin only) |

### Account / Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/account/register` | Register a new user |
| `POST` | `/account/login` | Login user |
| `POST` | `/account/refresh-token` | Get new access token using httpOnly cookie |
| `POST` | `/account/logout` | Logout user |

### AI
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/generate-description` | Gemini Pro generates description from details |

All URLs are **lowercase**. All responses use **camelCase** JSON property names and the `ApiResponse<T>` envelope.

---

## Validation

Validation is handled automatically via a **MediatR pipeline behavior** (`ValidationBehavior<TRequest, TResponse>`). Every command/query is validated against its registered FluentValidation validator before reaching the handler — no manual wiring needed in individual handlers.

Validation error codes are centralised in `Application/Events/Constants/ValidationErrors.cs` as constants (e.g. `TITLE_REQUIRED`, `LATITUDE_OUT_OF_RANGE`) so the frontend can rely on stable, localisation-friendly keys rather than free-form messages.

---

## Database Schema & Entity Relationships

This section documents every domain entity, its columns, foreign key relationships, delete behaviors, and index strategy. Keep this updated whenever a migration is added.

> **Convention:** All deletes are **soft deletes** (`IsDeleted = true`). Hard deletes are never performed. FKs that point to `AspNetUsers` use `Restrict` (cannot delete a user who is referenced) unless otherwise noted.

---

### Entities at a Glance

| Table | PK type | Soft delete | Hard delete | Row-version | Notes |
|---|---|---|---|---|---|
| `AspNetUsers` | `nvarchar(450)` | ❌ | ✅ | ❌ | Managed by ASP.NET Identity |
| `Events` | `uniqueidentifier` | ❌ | ✅ | ❌ | Core event listing |
| `Categories` | `uniqueidentifier` | ❌ | ✅ | ❌ | Event taxonomy |
| `CategorySuggestions` | `uniqueidentifier` | ❌ | ✅ | ❌ | Community proposals |
| `Organizations` | `uniqueidentifier` | ✅ | ❌ | ✅ | Organizer entity |
| `OrganizationMembers` | `uniqueidentifier` | ✅ | ❌ | ❌ | User ↔ Organization join |
| `Permissions` | `uniqueidentifier` | ❌ | ✅ | ❌ | System permissions (events.read) |
| `OrganizationRoles` | `uniqueidentifier` | ✅ | ❌ | ❌ | Roles scoped to an Organization |
| `OrganizationRolePermissions` | `(RoleId, PermId)` | ❌ | ✅ | ❌ | Role ↔ Permission join |
| `OrganizationMemberRoles` | `(MemberId, RoleId)` | ❌ | ✅ | ❌ | Member ↔ Role join |

---

### Entity Details

#### `Events`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `OrganizationId` | `uniqueidentifier` | ✅ | FK → `Organizations.Id` (`Restrict`). Required via Validation if created by Organizer |
| `Title` | `nvarchar` | ❌ | Required |
| `Description` | `nvarchar` | ❌ | Required |
| `City` | `nvarchar` | ❌ | |
| `Venue` | `nvarchar` | ❌ | |
| `CategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull` on delete) |
| `Date`, `Latitude`, `Longitude`, … | various | varies | |

**Relationships:**
- `OrganizationId` → `Organizations.Id` — `Restrict` (cannot delete org if it has events)
- `CategoryId` → `Categories.Id` — `SetNull` (event stays valid if category is deleted)

> **Design Note:** Why is `OrganizationId` nullable in the DB if it is mandatory to provide one when creating an event?
> 1. **Backward Compatibility:** Older events existed in the database before the Organizations feature was built. A `NOT NULL` constraint would have broken the database migration.
> 2. **Future Flexibility:** Allows the system administrators to create global, platform-level events that do not belong to any specific third-party organization.
> The API layer (`CreateEventCommandValidator`) strictly enforces that all user-created events must have an organization.


---

#### `Categories`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `nvarchar(200)` | ❌ | |
| `Slug` | `varchar(200)` | ❌ | **Unique** (`UX_Categories_Slug`) |
| `Description` | `nvarchar(2000)` | ✅ | |
| `IsActive` | `bit` | ❌ | Default `true` |
| `SortOrder` | `int` | ❌ | Default `0` |
| `CreatedAtUtc` | `datetimeoffset` | ❌ | |
| `UpdatedAtUtc` | `datetimeoffset` | ❌ | |

**Indexes:** `UX_Categories_Slug` (unique)

---

#### `CategorySuggestions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Name` | `nvarchar(200)` | ❌ | |
| `Slug` | `varchar(200)` | ❌ | |
| `Description` | `nvarchar(2000)` | ✅ | |
| `Status` | `int` | ❌ | Enum: `Pending=0`, `Approved=1`, `Rejected=2` |
| `SuggestedById` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `ReviewedById` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `ReviewedAt` | `datetimeoffset` | ✅ | |
| `RejectionReason` | `nvarchar` | ✅ | |
| `ApprovedCategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull`) |
| `OrganizationId` | `uniqueidentifier` | ✅ | Reserved for future use |
| `CreatedAtUtc` | `datetimeoffset` | ❌ | |
| `UpdatedAtUtc` | `datetimeoffset` | ❌ | |

**Relationships:**
- `SuggestedById` → `AspNetUsers.Id` — `Restrict`
- `ReviewedById` → `AspNetUsers.Id` — `Restrict` (nullable)
- `ApprovedCategoryId` → `Categories.Id` — `SetNull` (nullable)

**Indexes:** `IX_CategorySuggestions_Status`

---

#### `Organizations`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `Name` | `varchar(160)` | ❌ | |
| `Slug` | `varchar(180)` | ❌ | **Unique** (`UX_Organizations_Slug`) |
| `Description` | `nvarchar(max)` | ✅ | |
| `LogoUrl` | `nvarchar(max)` | ✅ | |
| `CoverImageUrl` | `nvarchar(max)` | ✅ | |
| `WebsiteUrl` | `nvarchar(max)` | ✅ | |
| `ContactEmail` | `varchar(256)` | ✅ | |
| `ContactPhone` | `varchar(40)` | ✅ | |
| `Status` | `varchar(30)` | ❌ | `pending_verification` \| `active` \| `suspended` \| `rejected` |
| `OwnerUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `VerifiedAtUtc` | `datetimeoffset` | ✅ | Set by Admin on approval |
| `VerifiedByUserId` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `CreatedAtUtc` | `datetimeoffset` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `UpdatedAtUtc` | `datetimeoffset` | ✅ | |
| `UpdatedByUserId` | `nvarchar(max)` | ✅ | |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetimeoffset` | ✅ | |
| `DeletedByUserId` | `nvarchar(max)` | ✅ | |
| `RowVersion` | `rowversion` | ❌ | Auto-managed optimistic-concurrency token |

**Relationships:**
- `OwnerUserId` → `AspNetUsers.Id` — `Restrict`
- `VerifiedByUserId` → `AspNetUsers.Id` — `Restrict` (nullable)
- `CreatedByUserId` → `AspNetUsers.Id` — `Restrict`

**Indexes:**
| Name | Columns | Unique |
|---|---|---|
| `UX_Organizations_Slug` | `Slug` | ✅ |
| `IX_Organizations_OwnerUserId` | `OwnerUserId` | ❌ |
| `IX_Organizations_Status` | `Status` | ❌ |

---

#### `OrganizationMembers`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK, client-generated |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `UserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `Status` | `int` | ❌ | Enum: `Invited=0`, `Active=1`, `Declined=2`, `Removed=3`. Default `0` |
| `JoinedAtUtc` | `datetimeoffset` | ✅ | Set when `Status` transitions to `Active` |
| `CreatedAtUtc` | `datetimeoffset` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetimeoffset` | ✅ | |
| `DeletedByUserId` | `nvarchar(max)` | ✅ | |

**Relationships:**
- `OrganizationId` → `Organizations.Id` — `Cascade` (safety net; orgs are soft-deleted)
- `UserId` → `AspNetUsers.Id` — `Restrict`
- `CreatedByUserId` → `AspNetUsers.Id` — `Restrict`

**Indexes:**
| Name | Columns | Unique | Filter | Purpose |
|---|---|---|---|---|
| `IX_OrganizationMembers_OrganizationId` | `OrganizationId` | ❌ | — | List all members of an org |
| `IX_OrganizationMembers_UserId` | `UserId` | ❌ | — | List all orgs a user belongs to |
| `UX_OrganizationMembers_Active` | `(OrganizationId, UserId)` | ✅ | `[Status]=1 AND [IsDeleted]=0` | **One active membership per user per org** |

**Uniqueness rule — `UX_OrganizationMembers_Active` (filtered unique index)**

A user may hold **at most one `Active` membership** per organization at any point in time. This is enforced at the database level by the filtered unique index above — not a composite primary key — for two reasons:

1. **Audit trail:** Historical rows (`Declined`, `Removed`) must be retained. A composite PK on `(OrganizationId, UserId)` would permanently prevent re-inviting a user after they leave.
2. **Soft deletes:** Soft-deleted rows (`IsDeleted = 1`) are excluded from the filter, so an archived record never blocks a new membership.

The filter `[Status] = 1 AND [IsDeleted] = 0` means only currently-active, non-deleted rows participate in uniqueness. Any attempt to `INSERT` or `UPDATE` a second active membership for the same `(OrganizationId, UserId)` pair is rejected by SQL Server before it reaches the application layer.

**State machine:**
```
Invited (0) ──► Active (1) ──► Removed (3)
          └───► Declined (2)
```

---

#### `Permissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `Code` | `varchar(120)` | ❌ | **Unique** (`UX_Permissions_Code`) |
| `Name` | `varchar(120)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `Category` | `varchar(80)` | ❌ | |

---

#### `OrganizationRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | ❌ | PK |
| `OrganizationId` | `uniqueidentifier` | ❌ | FK → `Organizations.Id` (`Cascade`) |
| `Name` | `varchar(80)` | ❌ | |
| `Description` | `nvarchar` | ✅ | |
| `IsSystemRole` | `bit` | ❌ | Default `false` |
| `CreatedAtUtc` | `datetimeoffset` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `UpdatedAtUtc` | `datetimeoffset` | ✅ | |
| `UpdatedByUserId` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `IsDeleted` | `bit` | ❌ | Default `false` |

**Indexes:** `UX_OrganizationRoles_OrganizationId_Name` (unique composite)

---

#### `OrganizationRolePermissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationRoleId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationRoles.Id` (`Cascade`) |
| `PermissionId` | `uniqueidentifier` | ❌ | PK Part, FK → `Permissions.Id` (`Cascade`) |

---

#### `OrganizationMemberRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationMemberId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationMembers.Id` (`Cascade`) |
| `OrganizationRoleId` | `uniqueidentifier` | ❌ | PK Part, FK → `OrganizationRoles.Id` (`Cascade`) |

---

### Migration History

| Migration | Date | Description |
|---|---|---|
| `InitialCreate` | 2026-06-28 | Identity tables + `Events` |
| `AddCategory` | 2026-07-03 | `Categories` table |
| `AddCategoryReferenceToEvent` | 2026-07-03 | `Events.CategoryId` FK |
| `RemoveEventCategoryString` | 2026-07-03 | Dropped legacy string category column |
| `CategorySuggestions` | 2026-07-04 | `CategorySuggestions` table |
| `AddOrganization` | 2026-07-12 | `Organizations` table |
| `AddOrganizationMember` | 2026-07-13 | `OrganizationMembers` table + filtered unique index |
| `UpdateToDateTimeOffset` | 2026-07-14 | Migrated DateTime to DateTimeOffset globally |
| `AddOrganizationRBAC` | 2026-07-14 | `Permissions`, `OrganizationRoles`, and RBAC join tables |
| `AddOrganizationIdToEvents` | 2026-07-16 | Added `OrganizationId` FK to `Events` table |


---

## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### 1. Run the API

```bash
cd API
dotnet watch
```

The API starts at `https://localhost:5001`. The SQL Server database is **auto-created and seeded** on first run (via `Program.cs`) — no manual migration step needed.

### 2. Run the Client

```bash
cd client
npm install
npm run dev
```

The React app starts at `http://localhost:3001`.

> **Note:** The API CORS policy is configured to allow `http://localhost:3001`. If your Vite dev server runs on a different port, update `Program.cs` accordingly.

---

## Features

### 🏠 Home Page
- **Greeting header** with time-aware message (Good Morning / Afternoon / Evening)
- **Category filter** bar — filter events by Music, Sports, Nightlife, etc.
- **Featured carousel** — auto-cycling hero carousel with navigation controls
- **Recommended For You** — horizontally scrollable event card strip (filtered by category)
- **Trending This Week** — latest events sorted by date

### 🗓️ Event Detail Page
- **Hero banner** with category badge, date, location and rating chips
- **Tab panel** — About, Schedule, and Venue tabs
- **Ticket panel** (desktop sidebar) — pricing tiers and booking CTA
- **Organiser card** with follow button
- **Location card** with coordinates
- **Delete Event** — confirmation dialog with title, warning, Cancel and "Yes, Delete Event" buttons; navigates home on success

### ✏️ Create / Edit Event Page
- Multi-section form: **Basic Info**, **Date & Time**, **Location**, **GPS Coordinates**
- Live preview card updates as you type
- Client-side validation with inline field errors; server-side validation errors surfaced from the `ApiResponse.errors` map
- **Publish Event** button POSTs to the API; shows success screen on completion

### 📱 Responsive Layout
- Mobile: top navbar with hamburger sheet drawer
- Desktop: fixed left sidebar (navigation) + fixed right sidebar (upcoming events, top organisers, weather widget)
- Lazy loading for Home and Create Event page bundles (code splitting)

### 🛡️ Admin Portal
- **Dashboard** with system-wide event statistics and data tables
- **Category Management** — create new categories via the right-side widget
- **Review Suggestions** — review, approve, or reject user-submitted category suggestions

---

## Scripts

### API
```bash
dotnet watch          # Run with hot reload
dotnet build          # Build only
dotnet test           # Run tests (if present)
```

### Client
```bash
npm run dev           # Start Vite dev server
npm run build         # Production build (tsc + vite build)
npm run lint          # ESLint check
npm run preview       # Preview production build locally
```

---

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.
