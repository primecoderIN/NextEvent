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
| Data fetching & caching | TanStack Query (React Query v5) |
| Form management | React Hook Form |
| Validation | Zod |
| Internationalization (i18n)| `react-i18next` + `i18next` |
| Theming | `next-themes` (Dark/Light mode) |
| Location Autocomplete | `@geoapify/react-geocoder-autocomplete` |
| Date Picking | `react-day-picker` + `date-fns` |
| Toast notifications | Sonner |
| Icons | Lucide React |
| Variant styles | class-variance-authority + clsx + tailwind-merge |
| Animations | `tw-animate-css` |

### Key Design Decisions

- **Date and Time Convention (UTC + TimeZoneId)**  
  We strictly use `DateTime` (in UTC) across the entire solution.
  - **Audit Timestamps**: Fields like `CreatedAtUtc` are pure UTC `DateTime` values mapped to SQL Server's `datetime2(3)`. Millisecond precision (3) saves 2 bytes per row over the default precision (7).
  - **Business Event Dates**: Scheduled events require both an absolute point in time (UTC) and a local context. We store the UTC point in time in a `Date` column (`datetime2(3)`) and the IANA timezone identifier (e.g. `"Asia/Kolkata"`) in a separate `TimeZoneId` string column.
  - **UI Display**: The frontend derives the local time strictly client-side using the UTC Date + IANA ID.
  - **Identity Exemption**: Third-party framework columns (like `User.LockoutEnd`) retain their original `datetimeoffset` types to prevent breaking internal ASP.NET Identity operations.

- **Tenant-Specific RBAC & BOLA Prevention**  
  Unlike ASP.NET Identity roles which are platform-wide (e.g., a user is an "Admin" everywhere), we implemented a custom Organization RBAC model. Users hold `OrganizationRoles` tied specifically to an `OrganizationId`, composed of granular `Permissions` (like `events.create`). This isolates authorization boundaries, preventing role-bleeding across different organizations.
  To strictly prevent Broken Object Level Authorization (BOLA), mutation handlers (e.g., `EditEvent`, `DeleteEvent`) do not trust user-provided organization IDs. Instead, they use a centralized `IEventAuthorizationService` that loads the target resource from the database, extracts its unforgeable `OrganizationId`, and verifies permissions against that true owner.

- **Single-Organization Policy**
  Users are restricted to an **Active** membership in at most one organization across the entire platform. Centralized checks in `IOrganizationMemberService` prevent a user from creating a new organization, receiving an invitation, or accepting an invitation if they are already part of any organization.

- **Strict Tenant Isolation & BFLA Prevention**
  Data visibility is strictly partitioned. Endpoints returning lists of data (like `GET /events/my`) inherently filter queries so an organizer only ever sees data belonging to their organization, actively ignoring any malicious query parameters attempting to cross tenant boundaries. Single-resource endpoints (like `GET /organizations/{id}`) unify logic for both members and Platform Admins, failing securely with a `404 Not Found` (rather than a 403) for unauthorized users to prevent resource enumeration.
  Furthermore, to prevent Broken Function Level Authorization (BFLA), all organizer-only API routes are firmly gated at the controller boundary using `[Authorize(Policy = "ActiveOrganizer")]`. This instantly rejects basic members or anonymous users without invoking deeper handler logic.

- **Profile Isolation (ActiveProfile)**  
  To provide a clean UX separation between "Member" (event attendee) and "Organizer" experiences, the `User` entity maintains an `ActiveProfile` state. This state is embedded into the JWT as a claim. The backend defines an `ActiveOrganizer` policy (requiring both the Organizer role AND the Organizer active profile claim) to protect organizer endpoints. The frontend mirrors this using a smart `<RequireProfile>` guard that prevents accidental cross-profile navigation, forcing explicit mode switching via the new `POST /api/account/switch-profile` endpoint without requiring multiple accounts.

- **Optimized Partial Updates (Frontend Diffing)**
  To minimize network payload size and reduce the risk of overwriting concurrent changes, frontend forms (like Event Updates and Role Management) are designed to perform a diff between the user's modifications and the original `defaultValues`. The client constructs a sparse payload containing *only* the explicitly modified fields, and the backend elegantly handles these via true partial updates (treating omitted fields as "do not update").

- **First-Class Internationalization (i18n)**
  The frontend is built from the ground up to support multiple languages using `i18next`. Language switching is seamless, and validation schemas (like Zod) are dynamically regenerated upon language change to instantly reflect localized error messages.

- **Dynamic Theming**
  The UI supports a dynamic Dark/Light mode toggle powered by `next-themes` and Tailwind CSS, seamlessly adjusting the aesthetic to the user's system preferences.

---

## Core Experiences (Frontend Screens)

The platform is strictly partitioned into three distinct user experiences, each with its own layout, navigation, and features:

### 1. Public / Member Experience
The default view for guests and logged-in members. Focuses on discovery and consumption.
- **Home/Discovery Feed**: Browse upcoming public events globally.
- **Event Details Screen**: View rich details, dates, and locations about a specific event.
- **Organization Public Profile**: A dedicated landing page for each organization showing their cover image, logo, description, contact details, and a feed of all their upcoming active events. 

### 2. Organizer Dashboard
Accessible only if the user is an active member of an organization and has switched their profile to "Organizer".
- **Dashboard Home**: Overview of the organization's events and status.
- **Event Management**: Dedicated forms to create, edit, cancel, and publish events. Integrates location autocomplete (Geoapify) and AI-assisted description generation.
- **Role Management**: Define custom RBAC roles with specific permissions (e.g., `events.create`, `roles.manage`).
- **Organization Settings**: Update the organization's public profile data (description, website, contact info).

### 3. Platform Admin Dashboard
Accessible only to global platform Administrators.
- **Pending Organizations**: Review, approve, or reject new organizations that have registered to use the platform.
- **Category Management**: Create and manage global event categories.
- **Platform Analytics**: Global view of the entire ecosystem.

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

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/events` | Anonymous | List public active events (IsCancelled = 0) |
| `GET` | `/events/my` | Platform `Organizer` | List events for current organizer |
| `GET` | `/events/admin` | Platform `Admin` | List all events across the platform |
| `GET` | `/events/{id}` | Anonymous | Get event by ID |
| `POST` | `/events` | Authenticated | Create a new event |
| `PUT` | `/events/{id}` | Authenticated | Edit an existing event (partial update supported) |
| `DELETE` | `/events/{id}` | Authenticated | Delete an event |

### Organizations
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/organizations` | Authenticated | Create a new organization (seeds default roles) |
| `GET` | `/organizations/{id}` | Anonymous | Get organization details by ID |
| `GET` | `/organizations/{slug}` | Anonymous | Get public organization profile + upcoming events |
| `POST` | `/organizations/{id}/approve` | Platform `Admin` | Approve a pending organization |
| `POST` | `/organizations/{id}/roles` | Org `roles.manage` | Create a custom organization role |
| `PUT` | `/organizations/{id}/roles/{roleId}` | Org `roles.manage` | Update an organization role |
| `POST` | `/organizations/{id}/members/invite` | Org `members.invite` | Invite a user to the organization via email |
| `POST` | `/organizations/{id}/members/accept-invite`| Authenticated | Accept a pending organization invitation |

### Permissions
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/permissions` | Authenticated | Get catalogue of system permissions available for roles |

### Categories
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/categories` | Anonymous | Get all categories |
| `POST` | `/categories` | Platform `Admin` | Create a new category |
| `GET` | `/categories/suggestions` | Platform `Admin` | Get category suggestions |
| `POST` | `/categories/suggest` | Authenticated | Suggest a new category |
| `POST` | `/categories/{id}/approve` | Platform `Admin` | Approve a category suggestion |
| `POST` | `/categories/{id}/reject` | Platform `Admin` | Reject a category suggestion |

### Account / Auth
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/account/register` | Anonymous | Register a new user |
| `POST` | `/account/login` | Anonymous | Login user |
| `POST` | `/account/refresh-token` | Anonymous | Get new access token using httpOnly cookie |
| `POST` | `/account/logout` | Authenticated | Logout user |

### AI
| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `POST` | `/ai/generate-description` | Anonymous | Gemini Pro generates description from details |

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
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ❌ | |

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
| `ReviewedAt` | `datetime2(3)` | ✅ | |
| `RejectionReason` | `nvarchar` | ✅ | |
| `ApprovedCategoryId` | `uniqueidentifier` | ✅ | FK → `Categories.Id` (`SetNull`) |
| `OrganizationId` | `uniqueidentifier` | ✅ | Reserved for future use |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `UpdatedAtUtc` | `datetime2(3)` | ❌ | |

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
| `VerifiedAtUtc` | `datetime2(3)` | ✅ | Set by Admin on approval |
| `VerifiedByUserId` | `nvarchar(450)` | ✅ | FK → `AspNetUsers.Id` (`Restrict`) |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
| `UpdatedByUserId` | `nvarchar(max)` | ✅ | |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetime2(3)` | ✅ | |
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
| `JoinedAtUtc` | `datetime2(3)` | ✅ | Set when `Status` transitions to `Active` |
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) — immutable |
| `IsDeleted` | `bit` | ❌ | Default `false` |
| `DeletedAtUtc` | `datetime2(3)` | ✅ | |
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
| `CreatedAtUtc` | `datetime2(3)` | ❌ | |
| `CreatedByUserId` | `nvarchar(450)` | ❌ | FK → `AspNetUsers.Id` (`Restrict`) |
| `UpdatedAtUtc` | `datetime2(3)` | ✅ | |
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
| `UpdateTodatetime2(3)` | 2026-07-14 | Migrated DateTime to datetime2(3) globally |
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
