# NextEvent

A full-stack event discovery and management platform. Browse upcoming events, view detailed event pages, create new events, and manage them â€” all in a clean, modern interface.

---

## Tech Stack

### Backend â€” ASP.NET Core Web API
| Layer | Technology |
|---|---|
| API | ASP.NET Core 10 |
| Architecture | Clean Architecture â€” Domain / Application / Persistence / API |
| CQRS | MediatR |
| Validation | FluentValidation + MediatR pipeline behavior |
| ORM | Entity Framework Core |
| Database | SQL Server (`NextEventDb`) |
| Serialisation | `System.Text.Json` with camelCase naming policy |
| URL style | Lowercase route generation |

### Frontend â€” React SPA
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
**DateTimeOffset over DateTime**  
We strictly use `DateTimeOffset` across the entire solution. This architectural decision provides several critical benefits:
- **Timezone Safety**: Exact points in time are unambiguous, explicitly storing the offset from UTC.
- **Native SQL Mapping**: It natively maps to EF Core's `datetimeoffset` column type without the overhead of custom string value converters.
- **Improved Database Indexing**: By storing as native `datetimeoffset` rather than strings, SQL Server can build more efficient indexes and perform faster range queries (e.g. finding upcoming events).
- **Seamless Serialization**: Generates standard ISO-8601 strings during `System.Text.Json` serialization (e.g., `+00:00`), which the frontend JavaScript `Date` object parses natively without needing custom date converters on the backend or parsing logic on the frontend.

**Tenant-Specific RBAC**  
Unlike ASP.NET Identity roles which are platform-wide (e.g., a user is an "Admin" everywhere), we implemented a custom Organization RBAC model. Users hold OrganizationRoles tied specifically to an OrganizationId, composed of granular Permissions (like events.create). This isolates authorization boundaries, preventing role-bleeding across different organizations the user might belong to.

---

## Project Structure

```
NextEvent/
â”œâ”€â”€ API/                        # ASP.NET Core Web API host
â”‚   â”œâ”€â”€ Common/
â”‚   â”‚   â””â”€â”€ ApiResponse.cs      # Generic response envelope + static factory
â”‚   â”œâ”€â”€ Controllers/
â”‚   â”‚   â”œâ”€â”€ AccountController.cs  # Auth endpoints
â”‚   â”‚   â”œâ”€â”€ AiController.cs       # AI integration endpoints
â”‚   â”‚   â”œâ”€â”€ BaseApiController.cs  # OkResponse<T> / CreatedResponse<T> helpers
â”‚   â”‚   â””â”€â”€ EventsController.cs   # Events CRUD endpoints
â”‚   â”œâ”€â”€ Middleware/
â”‚   â”‚   â””â”€â”€ ExceptionMiddleware.cs  # Centralised exception â†’ ApiResponse mapping
â”‚   â”œâ”€â”€ Program.cs              # DI setup, middleware, DB migration on startup
â”‚
â”œâ”€â”€ Application/                # Business logic (CQRS with MediatR)
â”‚   â”œâ”€â”€ Authentication/         # Auth feature folders
â”‚   â”‚   â”œâ”€â”€ Commands/
â”‚   â”‚   â”œâ”€â”€ DTOs/
â”‚   â”‚   â””â”€â”€ Interfaces/
â”‚   â”œâ”€â”€ Core/
â”‚   â”‚   â”œâ”€â”€ Exceptions/
â”‚   â”‚   â”‚   â”œâ”€â”€ NotFoundException.cs       # â†’ HTTP 404
â”‚   â”‚   â”‚   â””â”€â”€ BusinessRuleException.cs   # â†’ HTTP 409
â”‚   â”‚   â”œâ”€â”€ Interfaces/
â”‚   â”‚   â”‚   â””â”€â”€ IAppDBContext.cs           # Dependency Inversion for EF Core
â”‚   â”‚   â””â”€â”€ ValidationBehavior.cs          # MediatR pipeline: runs FluentValidation
â”‚   â””â”€â”€ Events/                 # Event feature folders
â”‚       â”œâ”€â”€ Commands/
â”‚       â”‚   â”œâ”€â”€ CreateEvent/
â”‚       â”‚   â”œâ”€â”€ DeleteEvent/
â”‚       â”‚   â””â”€â”€ EditEvent/
â”‚       â”œâ”€â”€ Constants/
â”‚       â”‚   â””â”€â”€ ValidationErrors.cs        # Centralised validation error codes
â”‚       â”œâ”€â”€ DTOs/
â”‚       â””â”€â”€ Queries/
â”‚           â”œâ”€â”€ GetEventDetailsById/
â”‚           â””â”€â”€ GetEventsList/
â”‚
â”œâ”€â”€ Domain/                     # Core domain entity
â”‚   â”œâ”€â”€ Event.cs                # Event entity with PATCH-friendly update methods (Guid PK)
â”‚   â””â”€â”€ User.cs                 # ASP.NET Core Identity user entity
â”‚
â”œâ”€â”€ Persistence/                # EF Core DbContext + data seeding
â”‚   â”œâ”€â”€ AppDBContext.cs         # Implements IAppDBContext
â”‚   â””â”€â”€ DBInitializer.cs        # Seeds initial Events and Roles
â”‚
â””â”€â”€ client/                     # React frontend (Vite)
    â””â”€â”€ src/
        â”œâ”€â”€ app/                # App-level configurations and routing portals
        â”‚   â”œâ”€â”€ (public)/       # Public routes and views (Home, Event Details)
        â”‚   â”œâ”€â”€ admin/          # Admin portal routes and dashboard
        â”‚   â”œâ”€â”€ organizer/      # Organizer portal routes and tools
        â”‚   â”œâ”€â”€ layout/         # Root layout providers and shells
        â”‚   â””â”€â”€ router/         # Centralized React Router v6 Data Router configuration
        â”œâ”€â”€ authorization/      # Auth logic, route guards, and session management
        â”œâ”€â”€ features/           # Feature-sliced domain modules (auth, events, categories...)
        â”œâ”€â”€ i18n/               # Internationalization setup and translation files
        â”œâ”€â”€ shared/             # Reusable layer decoupled from specific features
        â”‚   â”œâ”€â”€ constants/      # App-wide constants
        â”‚   â”œâ”€â”€ hooks/          # Reusable custom React hooks
        â”‚   â”œâ”€â”€ lib/            # Utility functions (e.g., tailwind merge helpers)
        â”‚   â””â”€â”€ ui/             # Base UI components (Radix/shadcn-style wrappers)
        â””â”€â”€ types/              # Global TypeScript types

---

## Architecture Guide

This section explains the core architectural decisions made in the NextEvent platform, covering both the **Backend** (ASP.NET Core Web API) and **Frontend** (React SPA). It is designed to answer the "Why" and "How" for developers working on the codebase.

### 1. Backend Architecture (ASP.NET Core)

The backend is structured using **Clean Architecture** combined with the **CQRS (Command Query Responsibility Segregation)** pattern.

* **1.1 Clean Architecture Layers & Dependency Flow**

The core principle of Clean Architecture is **Dependency Inversion**: the inner layers (containing business rules) must never depend on outer layers (containing infrastructure, frameworks, or databases). Source code dependencies can only point *inward*.

* **Domain (`Domain`)**: 
  * **Role**: At the absolute center of the application. It contains the core business entities (e.g., `Event`, `User`), value objects, and domain logic.
  * **Depends on**: Nothing (Zero dependencies on other projects).
  * **Why it has no dependencies**: The business entities must remain pure. If the Domain depended on EF Core, it would be tied to a specific database technology. By remaining independent, the domain models encapsulate only raw business rules (e.g., `Event` controls its own state via methods like `ChangeTitle()` rather than exposing public setters) and can be tested instantly without mocking a database.

* **Application (`Application`)**: 
  * **Role**: Contains the business use cases (Commands and Queries) and defines the interfaces for external services (e.g., `IAppDBContext`).
  * **Depends on**: **Domain layer only**.
  * **Why it depends on Domain**: It needs to retrieve and manipulate the `Event` and `User` entities to fulfill business use cases.
  * **Why it does NOT depend on Persistence/API**: The Application layer shouldn't care *how* data is saved (SQL vs NoSQL) or *how* it is requested (HTTP vs gRPC). It defines `IAppDBContext`, forcing the outer layers to implement the storage mechanism. This makes the business logic completely decoupled from infrastructure.

* **Persistence (`Persistence`)**: 
  * **Role**: The infrastructure layer responsible for data access. It implements the interfaces defined by the Application layer (e.g., `AppDBContext` implements `IAppDBContext`).
  * **Depends on**: **Application layer**.
  * **Why it depends on Application**: It must reference the Application layer to access the `IAppDBContext` interface it needs to implement. It also references the Domain layer implicitly to configure how entities map to the database via Entity Framework Core.
  * **Benefits**: If we decide to swap from SQL Server to PostgreSQL, we *only* change this layer. The Application and Domain layers remain entirely untouched.

* **API (`API`)**: 
  * **Role**: The presentation layer. It acts as the "Composition Root" in `Program.cs`, wiring up the Dependency Injection (DI) container.
  * **Depends on**: **Application and Persistence layers**.
  * **Why it depends on Application**: To dispatch HTTP requests to the business logic via MediatR.
  * **Why it depends on Persistence**: To register the `AppDBContext` into the Dependency Injection container during startup.

**The Ultimate Benefit:** Separation of Concerns. By strictly enforcing this dependency rule, our business logic is highly testable, completely ignorant of the database, and insulated from volatile UI/Framework changes.

* **1.2 CQRS with MediatR**

Instead of traditional fat controllers or sprawling service classes, we use **CQRS** implemented via **MediatR**.

* **Commands**: Actions that mutate state (e.g., `CreateEventCommand`, `DeleteEventCommand`).
* **Queries**: Actions that retrieve state without mutating it (e.g., `GetEventsListQuery`).

**How it works:**
1. The Controller receives an HTTP request and maps it to a Command/Query object.
2. `Mediator.Send(command)` dispatches the object.
3. MediatR finds the specific Handler (e.g., `CreateEventCommandHandler`) and executes it.

**Why:** 
1. **Single Responsibility:** Each handler is a separate class with exactly one reason to change.
2. **Feature Folders:** Code is organized by feature (e.g., `Application/Events/Commands/CreateEvent/`) rather than by technical concern. The Command, Handler, and Validator all sit side-by-side.
3. **Cross-Cutting Concerns:** MediatR allows us to inject pipeline behaviors (like global validation).

* **1.3 Validation Pipeline Behavior**

We use **FluentValidation** to validate requests. However, validators are *never* explicitly invoked inside the handlers.

**How:** We register an open generic MediatR `ValidationBehavior<TRequest, TResponse>`. Before MediatR invokes *any* handler, it runs the behavior. The behavior intercepts the request, looks for any FluentValidation classes, and validates the request. If it fails, it throws a `ValidationException`.

**Why:** Handlers remain pure. They assume the data is valid by the time it reaches them.

* **1.4 Global Exception Handling (ExceptionMiddleware)**

The API uses a custom middleware (`ExceptionMiddleware.cs`) that wraps the entire HTTP pipeline in a `try/catch` block.

**How:**
* Catches `ValidationException` -> returns HTTP 400 with a dictionary of field errors.
* Catches `NotFoundException` -> returns HTTP 404.
* Catches `BusinessRuleException` -> returns HTTP 409.
* Catches unhandled `Exception` -> returns HTTP 500.

**Why:** Controllers do not need to contain `try/catch` blocks or return `BadRequest()` manually. Handlers simply throw domain-specific exceptions, and the middleware guarantees a standardized JSON response envelope (`ApiResponse<T>`) is returned to the client.

* **1.5 Explicit Routing & Controller Base**

Controllers inherit from `BaseApiController`, but routing is explicitly defined on each class (e.g., `[Route("api/events")]`).

**Why:** Implicit routing (e.g., `[Route("api/[controller]")]`) is brittle. If a developer refactors the class name from `EventsController` to `NextEventsController`, the API contract silently breaks, instantly breaking the client apps. Explicit routing ensures URLs are decoupled from C# class names.

* **1.6 Entity Framework & Guid Primary Keys**

The `Event` entity uses a `Guid` as its primary key (`Id`).

**Why:** 
* `Guid` is natively supported by most databases as a highly optimized type (often stored as 16 bytes rather than a variable-length string).
* It allows the Application layer to generate IDs *before* saving to the database if needed, without waiting for the database to assign an auto-incrementing integer.
* It prevents predictability (unlike integers, users cannot guess the ID of the next event).

### 2. Frontend Architecture (React SPA)

The frontend is a Single Page Application (SPA) built for performance, modularity, and modern aesthetics.

* **2.1 Core Framework (React 19 + Vite)**

* **React 19**: Used for building the UI component tree.
* **Vite**: Replaces Create React App/Webpack. It uses native ES modules for near-instant dev server startup and extremely fast Hot Module Replacement (HMR).

* **2.2 Routing (React Router v6 Data Router)**

We use the **React Router v6 Data Router** (`createBrowserRouter`) to manage client-side navigation. 

**Decentralized Configuration:** To prevent routing logic from becoming a bloated monolith, routing is implemented using a **Feature-Sliced Design (FSD)** approach. Each portal (`admin`, `organizer`, `public`) owns and exports its specific `routes.tsx` configuration array. The global `app/router/index.tsx` simply imports these arrays and securely composes the top-level route tree.

**Why:** It allows users to transition between pages without full page reloads. The object-based Data Router unlocks advanced features like parallel data loading, actions, and strict error boundary isolation, while the decentralized setup ensures maximum scalability as the app grows.

* **2.3 Styling Strategy (Tailwind CSS v4 + Radix UI)**

The project eschews heavy component libraries (like Material UI) in favor of a **hand-rolled, utility-first** approach.

* **Tailwind CSS**: Utility classes allow for rapid styling directly in the markup without context-switching to CSS files. 
* **Radix UI**: Provides the unstyled, accessible primitives (Dialogs, Selects, Popovers). Radix handles the complex ARIA attributes, keyboard navigation, and focus management.
* **shadcn-style Architecture**: The `components/ui/` folder contains reusable components that wrap Radix primitives with Tailwind classes (using `class-variance-authority` and `tailwind-merge` to handle dynamic prop-based styling).

**Why:** Maximum customizability. We own the component code entirely. If we want a button to look exactly a certain way, we just edit `components/ui/button.tsx` instead of fighting against a vendor library's internal CSS specificity.

* **2.4 State Management & Data Fetching (React Query)**

**TanStack React Query** is the primary driver for fetching, caching, and updating asynchronous data from the API.

**Why:** Traditional React `useEffect` + `useState` fetching is prone to race conditions, lacks caching, and forces manual loading/error state management. React Query abstracts this away. It automatically caches identical requests, deduplicates network calls, and handles background refetching.

* **2.5 Form Handling (React Hook Form + Zod)**

Forms (like Create/Edit Event) are managed using **React Hook Form** coupled with **Zod** schema validation.

**How:** We define a Zod schema that perfectly mirrors the expected API validation rules. We pass this schema into React Hook Form via an `@hookform/resolvers/zod` adapter.

**Why:** 
* React Hook Form minimizes re-renders compared to traditional controlled inputs, making forms highly performant.
* Zod provides strict TypeScript type-safety. The form data is guaranteed to match the expected shape before it ever touches the network.

* **2.6 Localization (i18next)**

The client uses `react-i18next` for internationalization.

**Why:** Allows the application UI to be translated dynamically. It loads translation files via an HTTP backend and detects user language preferences automatically from the browser.

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
| `GET` | `/events` | `200 OK` | List all events |
| `GET` | `/events/{id}` | `200 OK` | Get event by ID |
| `POST` | `/events` | `201 Created` | Create a new event |
| `PUT` | `/events/{id}` | `200 OK` | Edit an existing event (partial update supported) |
| `DELETE` | `/events/{id}` | `200 OK` | Delete an event |

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
| `POST` | `/ai/generate-description` | GPT-4o-mini generates description from details |
| `POST` | `/ai/suggest-category` | GPT-4o-mini categorizes event based on title |

All URLs are **lowercase**. All responses use **camelCase** JSON property names and the `ApiResponse<T>` envelope.

---

## Validation

Validation is handled automatically via a **MediatR pipeline behavior** (`ValidationBehavior<TRequest, TResponse>`). Every command/query is validated against its registered FluentValidation validator before reaching the handler â€” no manual wiring needed in individual handlers.

Validation error codes are centralised in `Application/Events/Constants/ValidationErrors.cs` as constants (e.g. `TITLE_REQUIRED`, `LATITUDE_OUT_OF_RANGE`) so the frontend can rely on stable, localisation-friendly keys rather than free-form messages.

---

## Database Schema & Entity Relationships

This section documents every domain entity, its columns, foreign key relationships, delete behaviors, and index strategy. Keep this updated whenever a migration is added.

> **Convention:** All deletes are **soft deletes** (`IsDeleted = true`). Hard deletes are never performed. FKs that point to `AspNetUsers` use `Restrict` (cannot delete a user who is referenced) unless otherwise noted.

---

### Entities at a Glance

| Table | PK type | Soft delete | Hard delete | Row-version | Notes |
|---|---|---|---|---|---|
| `AspNetUsers` | `nvarchar(450)` | âœ— | âœ“ | âœ— | Managed by ASP.NET Identity |
| `Events` | `uniqueidentifier` | âœ— | âœ“ | âœ— | Core event listing |
| `Categories` | `uniqueidentifier` | âœ— | âœ“ | âœ— | Event taxonomy |
| `CategorySuggestions` | `uniqueidentifier` | âœ— | âœ“ | âœ— | Community proposals |
| `Organizations` | `uniqueidentifier` | âœ“ | âœ— | âœ“ | Organizer entity |
| `OrganizationMembers` | `uniqueidentifier` | âœ“ | âœ— | âœ— | User â†” Organization join |

---

### Entity Details

#### `Events`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âœ— | PK, client-generated |
| `Title` | `nvarchar` | âœ— | Required |
| `Description` | `nvarchar` | âœ— | Required |
| `City` | `nvarchar` | âœ— | |
| `Venue` | `nvarchar` | âœ— | |
| `CategoryId` | `uniqueidentifier` | âœ“ | FK â†’ `Categories.Id` (`SetNull` on delete) |
| `Date`, `Latitude`, `Longitude`, â€¦ | various | varies | |

**Relationships:**
- `CategoryId` â†’ `Categories.Id` â€” `SetNull` (event stays valid if category is deleted)

---

#### `Categories`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âœ— | PK |
| `Name` | `nvarchar(200)` | âœ— | |
| `Slug` | `varchar(200)` | âœ— | **Unique** (`UX_Categories_Slug`) |
| `Description` | `nvarchar(2000)` | âœ“ | |
| `IsActive` | `bit` | âœ— | Default `true` |
| `SortOrder` | `int` | âœ— | Default `0` |
| `CreatedAtUtc` | `datetimeoffset` | âœ— | |
| `UpdatedAtUtc` | `datetimeoffset` | âœ— | |

**Indexes:** `UX_Categories_Slug` (unique)

---

#### `CategorySuggestions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âœ— | PK |
| `Name` | `nvarchar(200)` | âœ— | |
| `Slug` | `varchar(200)` | âœ— | |
| `Description` | `nvarchar(2000)` | âœ“ | |
| `Status` | `int` | âœ— | Enum: `Pending=0`, `Approved=1`, `Rejected=2` |
| `SuggestedById` | `nvarchar(450)` | âœ— | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `ReviewedById` | `nvarchar(450)` | âœ“ | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `ReviewedAt` | `datetimeoffset` | âœ“ | |
| `RejectionReason` | `nvarchar` | âœ“ | |
| `ApprovedCategoryId` | `uniqueidentifier` | âœ“ | FK â†’ `Categories.Id` (`SetNull`) |
| `OrganizationId` | `uniqueidentifier` | âœ“ | Reserved for future use |
| `CreatedAtUtc` | `datetimeoffset` | âœ— | |
| `UpdatedAtUtc` | `datetimeoffset` | âœ— | |

**Relationships:**
- `SuggestedById` â†’ `AspNetUsers.Id` â€” `Restrict`
- `ReviewedById` â†’ `AspNetUsers.Id` â€” `Restrict` (nullable)
- `ApprovedCategoryId` â†’ `Categories.Id` â€” `SetNull` (nullable)

**Indexes:** `IX_CategorySuggestions_Status`

---

#### `Organizations`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âœ— | PK, client-generated |
| `Name` | `varchar(160)` | âœ— | |
| `Slug` | `varchar(180)` | âœ— | **Unique** (`UX_Organizations_Slug`) |
| `Description` | `nvarchar(max)` | âœ“ | |
| `LogoUrl` | `nvarchar(max)` | âœ“ | |
| `CoverImageUrl` | `nvarchar(max)` | âœ“ | |
| `WebsiteUrl` | `nvarchar(max)` | âœ“ | |
| `ContactEmail` | `varchar(256)` | âœ“ | |
| `ContactPhone` | `varchar(40)` | âœ“ | |
| `Status` | `varchar(30)` | âœ— | `pending_verification` \| `active` \| `suspended` \| `rejected` |
| `OwnerUserId` | `nvarchar(450)` | âœ— | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `VerifiedAtUtc` | `datetimeoffset` | âœ“ | Set by Admin on approval |
| `VerifiedByUserId` | `nvarchar(450)` | âœ“ | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `CreatedAtUtc` | `datetimeoffset` | âœ— | |
| `CreatedByUserId` | `nvarchar(450)` | âœ— | FK â†’ `AspNetUsers.Id` (`Restrict`) â€” immutable |
| `UpdatedAtUtc` | `datetimeoffset` | âœ“ | |
| `UpdatedByUserId` | `nvarchar(max)` | âœ“ | |
| `IsDeleted` | `bit` | âœ— | Default `false` |
| `DeletedAtUtc` | `datetimeoffset` | âœ“ | |
| `DeletedByUserId` | `nvarchar(max)` | âœ“ | |
| `RowVersion` | `rowversion` | âœ— | Auto-managed optimistic-concurrency token |

**Relationships:**
- `OwnerUserId` â†’ `AspNetUsers.Id` â€” `Restrict`
- `VerifiedByUserId` â†’ `AspNetUsers.Id` â€” `Restrict` (nullable)
- `CreatedByUserId` â†’ `AspNetUsers.Id` â€” `Restrict`

**Indexes:**
| Name | Columns | Unique |
|---|---|---|
| `UX_Organizations_Slug` | `Slug` | âœ“ |
| `IX_Organizations_OwnerUserId` | `OwnerUserId` | âœ— |
| `IX_Organizations_Status` | `Status` | âœ— |

---

#### `OrganizationMembers`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âœ— | PK, client-generated |
| `OrganizationId` | `uniqueidentifier` | âœ— | FK â†’ `Organizations.Id` (`Cascade`) |
| `UserId` | `nvarchar(450)` | âœ— | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `Status` | `int` | âœ— | Enum: `Invited=0`, `Active=1`, `Declined=2`, `Removed=3`. Default `0` |
| `JoinedAtUtc` | `datetimeoffset` | âœ“ | Set when `Status` transitions to `Active` |
| `CreatedAtUtc` | `datetimeoffset` | âœ— | |
| `CreatedByUserId` | `nvarchar(450)` | âœ— | FK â†’ `AspNetUsers.Id` (`Restrict`) â€” immutable |
| `IsDeleted` | `bit` | âœ— | Default `false` |
| `DeletedAtUtc` | `datetimeoffset` | âœ“ | |
| `DeletedByUserId` | `nvarchar(max)` | âœ“ | |

**Relationships:**
- `OrganizationId` â†’ `Organizations.Id` â€” `Cascade` (safety net; orgs are soft-deleted)
- `UserId` â†’ `AspNetUsers.Id` â€” `Restrict`
- `CreatedByUserId` â†’ `AspNetUsers.Id` â€” `Restrict`

**Indexes:**
| Name | Columns | Unique | Filter | Purpose |
|---|---|---|---|---|
| `IX_OrganizationMembers_OrganizationId` | `OrganizationId` | âœ— | â€” | List all members of an org |
| `IX_OrganizationMembers_UserId` | `UserId` | âœ— | â€” | List all orgs a user belongs to |
| `UX_OrganizationMembers_Active` | `(OrganizationId, UserId)` | âœ“ | `[Status]=1 AND [IsDeleted]=0` | **One active membership per user per org** |

**Uniqueness rule â€” `UX_OrganizationMembers_Active` (filtered unique index)**

A user may hold **at most one `Active` membership** per organization at any point in time. This is enforced at the database level by the filtered unique index above â€” not a composite primary key â€” for two reasons:

1. **Audit trail:** Historical rows (`Declined`, `Removed`) must be retained. A composite PK on `(OrganizationId, UserId)` would permanently prevent re-inviting a user after they leave.
2. **Soft deletes:** Soft-deleted rows (`IsDeleted = 1`) are excluded from the filter, so an archived record never blocks a new membership.

The filter `[Status] = 1 AND [IsDeleted] = 0` means only currently-active, non-deleted rows participate in uniqueness. Any attempt to `INSERT` or `UPDATE` a second active membership for the same `(OrganizationId, UserId)` pair is rejected by SQL Server before it reaches the application layer.

**State machine:**
```
Invited (0) â”€â”€â–º Active (1) â”€â”€â–º Removed (3)
          â””â”€â”€â”€â–º Declined (2)
```

---

#### `Permissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âŒ | PK |
| `Code` | `varchar(120)` | âŒ | **Unique** (`UX_Permissions_Code`) |
| `Name` | `varchar(120)` | âŒ | |
| `Description` | `nvarchar` | âœ… | |
| `Category` | `varchar(80)` | âŒ | |

---

#### `OrganizationRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `Id` | `uniqueidentifier` | âŒ | PK |
| `OrganizationId` | `uniqueidentifier` | âŒ | FK â†’ `Organizations.Id` (`Cascade`) |
| `Name` | `varchar(80)` | âŒ | |
| `Description` | `nvarchar` | âœ… | |
| `IsSystemRole` | `bit` | âŒ | Default `false` |
| `CreatedAtUtc` | `datetimeoffset` | âŒ | |
| `CreatedByUserId` | `nvarchar(450)` | âŒ | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `UpdatedAtUtc` | `datetimeoffset` | âœ… | |
| `UpdatedByUserId` | `nvarchar(450)` | âœ… | FK â†’ `AspNetUsers.Id` (`Restrict`) |
| `IsDeleted` | `bit` | âŒ | Default `false` |

**Indexes:** `UX_OrganizationRoles_OrganizationId_Name` (unique composite)

---

#### `OrganizationRolePermissions`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationRoleId` | `uniqueidentifier` | âŒ | PK Part, FK â†’ `OrganizationRoles.Id` (`Cascade`) |
| `PermissionId` | `uniqueidentifier` | âŒ | PK Part, FK â†’ `Permissions.Id` (`Cascade`) |

---

#### `OrganizationMemberRoles`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `OrganizationMemberId` | `uniqueidentifier` | âŒ | PK Part, FK â†’ `OrganizationMembers.Id` (`Cascade`) |
| `OrganizationRoleId` | `uniqueidentifier` | âŒ | PK Part, FK â†’ `OrganizationRoles.Id` (`Cascade`) |

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

The API starts at `https://localhost:5001`. The SQL Server database is **auto-created and seeded** on first run (via `Program.cs`) â€” no manual migration step needed.

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

### ðŸ  Home Page
- **Greeting header** with time-aware message (Good Morning / Afternoon / Evening)
- **Category filter** bar â€” filter events by Music, Sports, Nightlife, etc.
- **Featured carousel** â€” auto-cycling hero carousel with navigation controls
- **Recommended For You** â€” horizontally scrollable event card strip (filtered by category)
- **Trending This Week** â€” latest events sorted by date

### ðŸ—“ï¸ Event Detail Page
- **Hero banner** with category badge, date, location and rating chips
- **Tab panel** â€” About, Schedule, and Venue tabs
- **Ticket panel** (desktop sidebar) â€” pricing tiers and booking CTA
- **Organiser card** with follow button
- **Location card** with coordinates
- **Delete Event** â€” confirmation dialog with title, warning, Cancel and "Yes, Delete Event" buttons; navigates home on success

### âœï¸ Create / Edit Event Page
- Multi-section form: **Basic Info**, **Date & Time**, **Location**, **GPS Coordinates**
- Live preview card updates as you type
- Client-side validation with inline field errors; server-side validation errors surfaced from the `ApiResponse.errors` map
- **Publish Event** button POSTs to the API; shows success screen on completion

### ðŸ“± Responsive Layout
- Mobile: top navbar with hamburger sheet drawer
- Desktop: fixed left sidebar (navigation) + fixed right sidebar (upcoming events, top organisers, weather widget)
- Lazy loading for Home and Create Event page bundles (code splitting)

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

This project is licensed under the MIT License â€” see [LICENSE](./LICENSE) for details.

