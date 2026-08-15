# Architecture Guide

This section explains the core architectural decisions made in the NextEvent platform, covering both the **Backend** (ASP.NET Core Web API) and **Frontend** (React SPA). It is designed to answer the "Why" and "How" for developers working on the codebase.

## 1. Backend Architecture (ASP.NET Core)

The backend is structured using **Clean Architecture** combined with the **CQRS (Command Query Responsibility Segregation)** pattern.

### 1.1 Clean Architecture Layers & Dependency Flow
The core principle of Clean Architecture is **Dependency Inversion**: the inner layers (containing business rules) must never depend on outer layers (containing infrastructure, frameworks, or databases). Source code dependencies can only point *inward*.
* **Domain (`Domain`)**: At the absolute center of the application. It contains the core business entities (e.g., `Event`, `User`), value objects, and domain logic. It has zero dependencies on other projects. This ensures business entities remain pure and untied to specific database technologies (like EF Core), allowing raw business rules to be tested instantly without mocking a database.
* **Application (`Application`)**: Contains the business use cases (Commands and Queries) and defines the interfaces for external services (e.g., `IAppDBContext`). It depends only on the Domain layer. The Application layer defines *what* happens without caring *how* data is saved (SQL vs NoSQL) or requested (HTTP vs gRPC).
* **Persistence (`Persistence`)**: The infrastructure layer responsible for data access. It implements the interfaces defined by the Application layer (e.g., `AppDBContext` implements `IAppDBContext`). It depends on the Application layer. This decoupling means swapping from SQL Server to PostgreSQL only requires changing this layer.
* **API (`API`)**: The presentation layer. It acts as the "Composition Root" in `Program.cs`, wiring up the Dependency Injection (DI) container. It depends on the Application and Persistence layers to dispatch HTTP requests via MediatR and register the DB context.

### 1.2 CQRS with MediatR
Instead of traditional fat controllers or sprawling service classes, we use **CQRS** implemented via **MediatR**.
* **Commands**: Actions that mutate state (e.g., `CreateEventCommand`, `DeleteEventCommand`).
* **Queries**: Actions that retrieve state without mutating it (e.g., `GetEventsListQuery`).
* **Why:** Each handler has exactly one reason to change (Single Responsibility). Code is organized by feature rather than technical concern. Cross-cutting concerns are handled via MediatR pipeline behaviors.

### 1.3 Validation Pipeline Behavior
We use **FluentValidation** to validate requests. However, validators are *never* explicitly invoked inside the handlers.
* **How:** An open generic MediatR `ValidationBehavior<TRequest, TResponse>` intercepts requests before they reach the handler. If validation fails, it throws a `ValidationException`.
* **Why:** Handlers remain pure. They assume the data is valid by the time it reaches them.

### 1.4 Global Exception Handling (ExceptionMiddleware)
The API uses a custom middleware (`ExceptionMiddleware.cs`) that wraps the entire HTTP pipeline in a `try/catch` block.
* **How:** It catches domain exceptions like `ValidationException`, `NotFoundException`, and `BusinessRuleException` and maps them to appropriate HTTP status codes (`400`, `404`, `409`) with a standardized JSON response envelope (`ApiResponse<T>`).
* **Why:** Controllers do not need to contain `try/catch` blocks or return `BadRequest()` manually.

### 1.5 Explicit Routing & Controller Base
Controllers inherit from `BaseApiController`, but routing is explicitly defined on each class (e.g., `[Route("api/events")]`).
* **Why:** Implicit routing based on class names is brittle. Explicit routing ensures URLs are decoupled from C# class names, preventing silent contract breaks when refactoring.

### 1.6 Entity Framework & Guid Primary Keys
The `Event` entity uses a `Guid` as its primary key (`Id`).
* **Why:** `Guid` is natively supported by most databases, allows the Application layer to generate IDs *before* saving, and prevents predictability (unlike integers).

---

## 2. Frontend Architecture (React SPA)

The frontend is a Single Page Application (SPA) built for performance, modularity, and modern aesthetics.

### 2.1 Core Framework (React 19 + Vite)
* **React 19**: Used for building the UI component tree.
* **Vite**: Replaces Create React App/Webpack. It uses native ES modules for near-instant dev server startup and extremely fast Hot Module Replacement (HMR).

### 2.2 Routing (React Router v7 Data Router)
We use the **React Router v7 Data Router** (`createBrowserRouter`) to manage client-side navigation. 
* **Decentralized Configuration:** Routing is implemented using a **Feature-Sliced Design (FSD)** approach. Each portal (`admin`, `organizer`, `public`) owns its specific `routes.tsx` configuration array. The global router securely composes the top-level route tree.
* **Why:** The object-based Data Router unlocks advanced features like parallel data loading, actions, and strict error boundary isolation.

### 2.3 Styling Strategy (Tailwind CSS v4 + Radix UI)
The project eschews heavy component libraries in favor of a **hand-rolled, utility-first** approach.
* **Tailwind CSS**: Utility classes allow for rapid styling directly in the markup.
* **Radix UI**: Provides unstyled, accessible primitives (Dialogs, Selects, Popovers) handling complex ARIA attributes and focus management.
* **shadcn-style Architecture**: The `components/ui/` folder contains reusable components that wrap Radix primitives with Tailwind classes.
* **Why:** Maximum customizability. We own the component code entirely without fighting a vendor library's internal CSS specificity.

### 2.4 State Management & Data Fetching (React Query)
**TanStack React Query** is the primary driver for fetching, caching, and updating asynchronous data from the API.
* **Why:** It abstract away race conditions, manual caching, and loading/error state management inherent in traditional `useEffect` fetching.
* **Note on isolation:** Data fetching hooks are strictly isolated by bounded context (e.g., `useEvents` for public, `useMyEvents` for organizers, `useAdminEvents` for admins). This prevents data leakage and ensures clean frontend components that don't juggle roles.

### 2.5 Form Handling (React Hook Form + Zod)
Forms are managed using **React Hook Form** coupled with **Zod** schema validation.
* **Why:** React Hook Form minimizes re-renders, while Zod provides strict TypeScript type-safety ensuring form data matches the expected API shape.

### 2.6 Localization (i18next)
The client uses `react-i18next` for internationalization.
* **Why:** Allows dynamic UI translation via HTTP backend loading and automatic browser language detection.

---

## 3. API Response Envelope

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

## 4. Validation

Validation is handled automatically via a **MediatR pipeline behavior** (`ValidationBehavior<TRequest, TResponse>`). Every command/query is validated against its registered FluentValidation validator before reaching the handler — no manual wiring needed in individual handlers.

Validation error codes are centralised in `Application/Events/Constants/ValidationErrors.cs` as constants (e.g. `TITLE_REQUIRED`, `LATITUDE_OUT_OF_RANGE`) so the frontend can rely on stable, localisation-friendly keys rather than free-form messages.
