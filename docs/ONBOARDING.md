# Welcome to NextEvent! (Onboarding Guide)

Welcome to the **NextEvent** team! This document is your one-stop guide to understanding what this platform is, how it's built, the architectural choices we've made, and how to start working on it right away.

---

## 1. Project Overview & Features

**NextEvent** is a full-stack enterprise-grade event discovery and management platform. It serves three primary types of users:
1. **Members (Customers):** Browse upcoming events, search by category, view detailed event pages.
2. **Organizers:** Create and manage their own organizations, manage team roles/permissions, and publish/manage events.
3. **Admins:** Manage platform-wide categories, approve pending organizations, and oversee platform activity.

### Core Features
* **🏠 Home Page:** Greeting header, category filter bar, auto-cycling hero carousel, recommended/trending event strips.
* **🗓️ Event Detail Page:** Hero banner, about/schedule/venue tabs, ticket pricing sidebar, organizer card, location map.
* **✏️ Create / Edit Event:** Multi-section form (Basic Info, Date & Time, Location, GPS) with live preview updates, client & server-side validation.
* **📱 Responsive Layout:** Mobile hamburger drawer, desktop fixed sidebars, lazy loaded code splitting.
* **🛡️ Admin Portal:** System-wide dashboard statistics, category management, suggestion reviews.

---

## 2. Tech Stack

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
| Data Fetching | TanStack React Query |
| Form Handling | React Hook Form + Zod |

---

## 3. The Journey from Day 1: What We Built and Why

Our development journey has been highly iterative:

* **Phase 1 (The Foundation):** We started with an ASP.NET Core Web API using Clean Architecture and a React (Vite) frontend. Set up EF Core, SQL Server, ASP.NET Identity, and JWTs via HTTP-only cookies.
* **Phase 2 (Refactoring for Scale):** Refactored frontend to **Feature-Sliced Design (FSD)**. On the backend, we strictified Clean Architecture via **MediatR (CQRS)** and **FluentValidation**. We also brought in Dapper for high-speed read queries.
* **Phase 3 (Organizations & Enterprise RBAC):** Introduced multi-tenancy (`Organizations`) allowing users to act as organizers. We built a custom RBAC system (`OrganizationRoles` mapped to granular `Permissions`).
* **Phase 4 (Security & Profile Isolation):** Implemented an **Active Profile** concept (Member vs Organizer) embedded into the JWT, preventing "role-bleeding" during UX navigation. Smart frontend guards (`<RequireProfile>`) and backend policies (`ActiveOrganizer`) enforce these boundaries.

---

## 4. Architecture & Key Design Decisions

### 4.1 Backend Architecture
* **CQRS with MediatR:** Every use case is either a Command (mutates state) or a Query (reads state).
* **Thin Controllers:** Controllers only map HTTP requests to MediatR commands/queries and return a standardized `ApiResponse<T>`. Validation happens automatically via `ValidationBehavior`, and errors are mapped via `ExceptionMiddleware`.
* **Date and Time Convention (UTC + TimeZoneId):** We strictly use `DateTime` (in UTC) across the entire solution mapped to SQL Server's `datetime2(3)`. To support local contexts (like events), we store an IANA timezone identifier (e.g. `"Asia/Kolkata"`) in a separate `TimeZoneId` string column.
* **UTC Enforcement:** To guarantee JSON serialization outputs the `Z` offset, we configured a global EF Core convention (`UtcDateTimeConverter`) and global Dapper TypeHandlers (`UtcDateTimeHandler`) which force `DateTimeKind.Utc` on all dates read from the database.
* **Tenant-Specific RBAC:** Unlike ASP.NET Identity roles which are platform-wide, we implemented a custom Organization RBAC model. Users hold `OrganizationRoles` tied specifically to an `OrganizationId`, preventing role-bleeding.

### 4.2 Frontend Architecture
* **React Query:** Handles caching, background refetching, and race conditions, replacing `useEffect` fetching. Isolated by bounded contexts (e.g., `useEvents` vs `useAdminEvents`).
* **Hook Form + Zod:** Form state is managed with React Hook Form to minimize re-renders, while Zod ensures strict TypeScript type-safety.
* **Styling Strategy:** A hand-rolled utility-first approach using Tailwind CSS v4 + Radix UI (for accessible unstyled primitives).

### 4.3 Standard API Response Envelope
Every API endpoint returns the exact same JSON shape:
```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { ... },
  "errors": {}
}
```

| Exception | HTTP Status | Scenario |
|---|---|---|
| `ValidationException` | `400 Bad Request` | FluentValidation failures |
| `NotFoundException` | `404 Not Found` | Resource does not exist |
| `BusinessRuleException` | `409 Conflict` | Domain rule violated |
| Unhandled `Exception` | `500 Internal Server Error` | Unexpected server error |

---

## 5. Backend Deep Dive: Clean Architecture & Layers

We strictly adhere to Clean Architecture: `API -> Application -> Domain <- Persistence`.

1. **`API/` (Presentation):** Contains thin Controllers mapping HTTP to MediatR, global Middleware (`ExceptionMiddleware`), and web Services (`CurrentUserService`).
2. **`Application/` (Business Use Cases):** Contains core use cases grouped by feature slices (e.g., `Events/`, `Organizations/`). Defines interfaces (`ICurrentUserService`) for outer layers.
3. **`Domain/` (Enterprise Logic):** Contains Entities (`Event.cs`), Constants, and specific exceptions. References nothing outside itself.
4. **`Persistence/` (Infrastructure):** Contains EF Core `AppDBContext`, database seeders, and `SqlConnectionFactory` for raw Dapper queries.

---

## 6. Database Schema & Entity Relationships

We use **GUID Primary Keys** and **Soft Deletes** (`IsDeleted = true`) extensively. 

| Table | PK type | Soft delete | Hard delete | Notes |
|---|---|---|---|---|
| `AspNetUsers` | `nvarchar(450)` | ❌ | ✅ | Managed by ASP.NET Identity |
| `Events` | `uniqueidentifier` | ❌ | ✅ | Core event listing (FK to Organizations and Categories) |
| `Categories` | `uniqueidentifier` | ❌ | ✅ | Event taxonomy |
| `Organizations` | `uniqueidentifier` | ✅ | ❌ | Organizer entity |
| `OrganizationMembers` | `uniqueidentifier` | ✅ | ❌ | User ↔ Organization join |
| `Permissions` | `uniqueidentifier` | ❌ | ✅ | System permissions |
| `OrganizationRoles` | `uniqueidentifier` | ✅ | ❌ | Roles scoped to an Organization |

*Note: We enforce a filtered unique index `UX_OrganizationMembers_Active` on `(OrganizationId, UserId)` meaning a user can only have one active membership per organization at a time, ignoring soft-deleted history.*

---

## 7. API Endpoints

Base URL: `https://localhost:5001/api`

### Events
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/events` | List public active events |
| `GET` | `/events/my` | List events for current organizer |
| `GET` | `/events/admin` | List all events (Admin only) |
| `POST` | `/events` | Create a new event |
| `PUT` | `/events/{id}` | Edit an existing event |

### Organizations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/organizations` | Create a new organization |
| `GET` | `/organizations/{slug}` | Get public profile + events |
| `POST` | `/organizations/{id}/approve` | Approve a pending organization |
| `POST` | `/organizations/{id}/roles` | Create a custom org role |

### Categories
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/categories` | Get all categories |
| `POST` | `/categories/suggest` | Suggest a new category |
| `POST` | `/categories/{id}/approve` | Approve a category suggestion |

---

## 8. How to Get Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- SQL Server (LocalDB or Docker)

### Running the Project

**1. Start the API:**
```bash
cd API
dotnet watch
```
*(The API will run on `https://localhost:5001`. On the first run, it will automatically run EF Core migrations and seed the database with initial roles, categories, and test data.)*

**2. Start the Frontend:**
```bash
cd client
npm install
npm run dev
```
*(The React app runs on `http://localhost:3001`.)*

### Scripts Cheat Sheet
* **API:** `dotnet watch` (Run with hot reload), `dotnet test` (Run tests)
* **Client:** `npm run dev` (Start Vite server), `npm run build` (Production build), `npm run preview` (Preview build locally)
