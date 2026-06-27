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
| Database | SQLite (file: `API/nextevents.db`) |
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
│   └── nextevents.db           # SQLite database (auto-created)
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
        ├── app/
        │   └── layout/         # App shell: routing, Navbar, sidebars
        ├── components/
        │   └── ui/             # Shared shadcn-style components
        │       ├── button.tsx
        │       ├── dialog.tsx
        │       ├── input.tsx
        │       ├── label.tsx
        │       ├── select.tsx
        │       ├── sheet.tsx
        │       └── textarea.tsx
        ├── features/
        │   ├── home/           # Home page: category filter, featured carousel, event cards
        │   ├── event-detail/   # Event detail page: hero, tabs, ticket panel, delete
        │   └── create-event/   # Multi-section create event form
        ├── hooks/              # API hooks (useEvents, useEventDetail, useCreateEvent, useDeleteEvent)
        └── Types/              # Shared TypeScript types (Event)
```

---

## Architecture Guide

This section explains the core architectural decisions made in the NextEvent platform, covering both the **Backend** (ASP.NET Core Web API) and **Frontend** (React SPA). It is designed to answer the "Why" and "How" for developers working on the codebase.

### 1. Backend Architecture (ASP.NET Core)

The backend is structured using **Clean Architecture** combined with the **CQRS (Command Query Responsibility Segregation)** pattern.

#### 1.1 Clean Architecture Layers & Dependency Flow

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
  * **Benefits**: If we decide to swap from SQLite to PostgreSQL, we *only* change this layer. The Application and Domain layers remain entirely untouched.

* **API (`API`)**: 
  * **Role**: The presentation layer. It acts as the "Composition Root" in `Program.cs`, wiring up the Dependency Injection (DI) container.
  * **Depends on**: **Application and Persistence layers**.
  * **Why it depends on Application**: To dispatch HTTP requests to the business logic via MediatR.
  * **Why it depends on Persistence**: To register the `AppDBContext` into the Dependency Injection container during startup.

**The Ultimate Benefit:** Separation of Concerns. By strictly enforcing this dependency rule, our business logic is highly testable, completely ignorant of the database, and insulated from volatile UI/Framework changes.

#### 1.2 CQRS with MediatR

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

#### 1.3 Validation Pipeline Behavior

We use **FluentValidation** to validate requests. However, validators are *never* explicitly invoked inside the handlers.

**How:** We register an open generic MediatR `ValidationBehavior<TRequest, TResponse>`. Before MediatR invokes *any* handler, it runs the behavior. The behavior intercepts the request, looks for any FluentValidation classes, and validates the request. If it fails, it throws a `ValidationException`.

**Why:** Handlers remain pure. They assume the data is valid by the time it reaches them.

#### 1.4 Global Exception Handling (ExceptionMiddleware)

The API uses a custom middleware (`ExceptionMiddleware.cs`) that wraps the entire HTTP pipeline in a `try/catch` block.

**How:**
* Catches `ValidationException` -> returns HTTP 400 with a dictionary of field errors.
* Catches `NotFoundException` -> returns HTTP 404.
* Catches `BusinessRuleException` -> returns HTTP 409.
* Catches unhandled `Exception` -> returns HTTP 500.

**Why:** Controllers do not need to contain `try/catch` blocks or return `BadRequest()` manually. Handlers simply throw domain-specific exceptions, and the middleware guarantees a standardized JSON response envelope (`ApiResponse<T>`) is returned to the client.

#### 1.5 Explicit Routing & Controller Base

Controllers inherit from `BaseApiController`, but routing is explicitly defined on each class (e.g., `[Route("api/events")]`).

**Why:** Implicit routing (e.g., `[Route("api/[controller]")]`) is brittle. If a developer refactors the class name from `EventsController` to `NextEventsController`, the API contract silently breaks, instantly breaking the client apps. Explicit routing ensures URLs are decoupled from C# class names.

#### 1.6 Entity Framework & Guid Primary Keys

The `Event` entity uses a `Guid` as its primary key (`Id`).

**Why:** 
* `Guid` is natively supported by most databases as a highly optimized type (often stored as 16 bytes rather than a variable-length string).
* It allows the Application layer to generate IDs *before* saving to the database if needed, without waiting for the database to assign an auto-incrementing integer.
* It prevents predictability (unlike integers, users cannot guess the ID of the next event).

### 2. Frontend Architecture (React SPA)

The frontend is a Single Page Application (SPA) built for performance, modularity, and modern aesthetics.

#### 2.1 Core Framework (React 19 + Vite)

* **React 19**: Used for building the UI component tree.
* **Vite**: Replaces Create React App/Webpack. It uses native ES modules for near-instant dev server startup and extremely fast Hot Module Replacement (HMR).

#### 2.2 Routing (React Router)

We use **React Router** to manage client-side navigation. 
**Why:** It allows users to transition between pages (Home, Event Details, Create Event) without full page reloads, preserving application state and providing a fluid experience.

#### 2.3 Styling Strategy (Tailwind CSS v4 + Radix UI)

The project eschews heavy component libraries (like Material UI) in favor of a **hand-rolled, utility-first** approach.

* **Tailwind CSS**: Utility classes allow for rapid styling directly in the markup without context-switching to CSS files. 
* **Radix UI**: Provides the unstyled, accessible primitives (Dialogs, Selects, Popovers). Radix handles the complex ARIA attributes, keyboard navigation, and focus management.
* **shadcn-style Architecture**: The `components/ui/` folder contains reusable components that wrap Radix primitives with Tailwind classes (using `class-variance-authority` and `tailwind-merge` to handle dynamic prop-based styling).

**Why:** Maximum customizability. We own the component code entirely. If we want a button to look exactly a certain way, we just edit `components/ui/button.tsx` instead of fighting against a vendor library's internal CSS specificity.

#### 2.4 State Management & Data Fetching (React Query)

**TanStack React Query** is the primary driver for fetching, caching, and updating asynchronous data from the API.

**Why:** Traditional React `useEffect` + `useState` fetching is prone to race conditions, lacks caching, and forces manual loading/error state management. React Query abstracts this away. It automatically caches identical requests, deduplicates network calls, and handles background refetching.

#### 2.5 Form Handling (React Hook Form + Zod)

Forms (like Create/Edit Event) are managed using **React Hook Form** coupled with **Zod** schema validation.

**How:** We define a Zod schema that perfectly mirrors the expected API validation rules. We pass this schema into React Hook Form via an `@hookform/resolvers/zod` adapter.

**Why:** 
* React Hook Form minimizes re-renders compared to traditional controlled inputs, making forms highly performant.
* Zod provides strict TypeScript type-safety. The form data is guaranteed to match the expected shape before it ever touches the network.

#### 2.6 Localization (i18next)

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

Validation is handled automatically via a **MediatR pipeline behavior** (`ValidationBehavior<TRequest, TResponse>`). Every command/query is validated against its registered FluentValidation validator before reaching the handler — no manual wiring needed in individual handlers.

Validation error codes are centralised in `Application/Events/Constants/ValidationErrors.cs` as constants (e.g. `TITLE_REQUIRED`, `LATITUDE_OUT_OF_RANGE`) so the frontend can rely on stable, localisation-friendly keys rather than free-form messages.

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

The API starts at `https://localhost:5001`. SQLite database is **auto-created and seeded** on first run — no manual migration step needed.

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
