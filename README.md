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
│   │   ├── BaseApiController.cs  # OkResponse<T> / CreatedResponse<T> helpers
│   │   └── EventsController.cs
│   ├── Middleware/
│   │   └── ExceptionMiddleware.cs  # Centralised exception → ApiResponse mapping
│   ├── Program.cs              # DI setup, middleware, DB migration on startup
│   └── nextevents.db           # SQLite database (auto-created)
│
├── Application/                # Business logic (CQRS with MediatR)
│   ├── Core/
│   │   ├── Exceptions/
│   │   │   ├── NotFoundException.cs       # → HTTP 404
│   │   │   └── BusinessRuleException.cs   # → HTTP 409
│   │   └── ValidationBehavior.cs          # MediatR pipeline: runs FluentValidation
│   └── Events/
│       ├── Commands/
│       │   ├── CreateEvent.cs
│       │   ├── DeleteEvent.cs
│       │   └── EditEvent.cs
│       ├── Constants/
│       │   └── ValidationErrors.cs        # Centralised validation error codes
│       ├── Queries/
│       │   ├── GetEventsList.cs
│       │   └── GetEventDetailsById.cs
│       └── Validators/
│           └── CreateEventValidator.cs
│
├── Domain/                     # Core domain entity
│   └── Event.cs                # Event entity with PATCH-friendly update methods
│
├── Persistence/                # EF Core DbContext + data seeding
│   └── AppDBContext.cs
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
