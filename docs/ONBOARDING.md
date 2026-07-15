# Backend Developer Onboarding Guide

Welcome to the NextEvent Backend! This document is designed to get you up to speed with our architecture, core entities, design patterns, and directory structure. We strive for a highly maintainable, testable, and scalable backend using **Clean Architecture** and **CQRS**.

---

## 1. Clean Architecture & Separation of Layers

Our solution is divided into four main projects. We strictly follow the **Dependency Inversion Principle** where dependencies point *inwards* towards the Domain layer.

### Dependency Flow
`API` ➔ `Application` & `Persistence`
`Persistence` ➔ `Application` & `Domain`
`Application` ➔ `Domain`
`Domain` ➔ *(No dependencies)*

### The Layers

1. **Domain (`Domain/`)**
   - **What it is:** The heart of our software. It contains enterprise logic, entities, value objects, and enums.
   - **Rules:** It must **never** reference any other project in the solution or any infrastructure/database frameworks (like Entity Framework Core). 

2. **Application (`Application/`)**
   - **What it is:** Contains the business use cases of our system (Commands and Queries). It defines the interfaces that outer layers must implement (e.g., `IAppDBContext`, `ICurrentUserService`).
   - **Rules:** It only references the `Domain` project. It does not know about HTTP, SQL Server, or any specific presentation technology.

3. **Persistence (`Persistence/`)**
   - **What it is:** The infrastructure layer responsible for data access. It implements the interfaces defined in the Application layer.
   - **Rules:** References `Application` and `Domain`. Contains our Entity Framework Core `AppDBContext`, migrations, database seeding, and SQL connection factories.

4. **API (`API/`)**
   - **What it is:** The presentation layer. It acts as the "Composition Root" (wiring up Dependency Injection in `Program.cs`), handles HTTP requests, and routes them to the Application layer.
   - **Rules:** Controllers must remain extremely thin. They should only take HTTP requests, map them to a Command/Query, dispatch them via MediatR, and return the formatted HTTP response.

---

## 2. Core Entities & Relationships

Understanding the domain model is critical. Here are the core entities and how they relate:

- **`User` (ASP.NET Identity):** Represents an authenticated person in the system. Has platform-level roles (`Member`, `Organizer`, `Admin`).
- **`Event`:** The core business entity. Created by a user under an Organization. Has properties like `Title`, `Date`, `Location`, and links to a `Category`.
- **`Category` & `CategorySuggestion`:** Taxonomy for Events. Users can suggest new categories which Admins can approve or reject.
- **`Organization`:** Represents an event organizing company or group. A user can own multiple organizations.
- **`OrganizationMember`:** A join entity representing a user's membership in an Organization. Has a `Status` (Invited, Active, Removed).
- **`OrganizationRole` & `Permission`:** Custom Role-Based Access Control (RBAC) scoped strictly to an Organization (e.g., an "Event Manager" role that has `events.create` permission).
  - `OrganizationRolePermission` maps Roles to Permissions.
  - `OrganizationMemberRole` maps Members to Roles.

*Note: We heavily utilize **Soft Deletes** (`IsDeleted = true`) rather than hard deleting records to maintain audit trails.*

---

## 3. Keeping Controllers & Program.cs Thin

To maintain a clean and readable codebase, we strictly enforce "thin" entry points.

### Thin `Program.cs`
Instead of having a massive `Program.cs` file stuffed with hundreds of lines of dependency injection registrations, we use **Service Extensions**. 
- If you look in `API/Extensions/`, you'll see files like `ApiServiceExtensions.cs`, `DatabaseServiceExtensions.cs`, etc. 
- These files encapsulate the `IServiceCollection` configurations. 
- As a result, `Program.cs` remains incredibly clean, simply calling `builder.Services.AddApplicationServices()`, `builder.Services.AddDatabaseServices()`, etc.

### Thin Controllers
Our controllers are devoid of business logic, database queries, and manual validation. 
- Controllers inherit from `BaseApiController` which provides standardized response helpers (e.g., `OkResponse`, `CreatedResponse`).
- Thanks to **MediatR**, a controller method typically does exactly one thing: `await Mediator.Send(command);`
- Validation happens automatically via the MediatR pipeline. 
- Error handling happens automatically via `ExceptionMiddleware`.

---

## 4. Services, Interfaces, and Dependency Inversion

At the core of Clean Architecture is the **Dependency Inversion Principle**. Our `Application` layer contains the business logic but it must not depend on web frameworks or databases. 

### How it works:
1. **Define the Contract:** The `Application` layer defines interfaces for anything it needs from the outside world. For example, `ICurrentUserService` or `IIdentityService`.
2. **Implement in Outer Layers:** The outer layers (like `API` or `Persistence`) implement these interfaces. For example, `CurrentUserService.cs` lives in the `API` layer because it needs to access `IHttpContextAccessor` (a web concern).
3. **Inject via DI:** The dependency injection container wires the interface to the concrete implementation.

### Why we do this:
- **Decoupling:** The core logic has zero knowledge of HTTP requests, cookies, or Entity Framework. 
- **Testability:** We can easily mock `ICurrentUserService` in unit tests to simulate different users without needing a real HTTP context.
- **Maintainability:** If we ever switch our auth mechanism or database provider, we only have to change the implementation in the outer layer. The `Application` layer remains completely untouched.

---

## 5. The "What & How" of Key Aspects

### CQRS via MediatR
We use **Command Query Responsibility Segregation (CQRS)** implemented via the `MediatR` library. 
- **What it is:** Instead of traditional "Service Classes" (e.g., `EventService` with 20 methods), we split every use case into a distinct Command (mutates state) or Query (reads state).
- **How it works:**
  - **Commands/Queries:** Simple objects holding data (e.g., `CreateEventCommand`).
  - **Handlers:** Classes containing the actual execution logic (e.g., `CreateEventCommandHandler`).
  - Controllers simply do: `await Mediator.Send(command);`

### Validation Pipeline (FluentValidation)
- **What it is:** We validate incoming data *before* it reaches the Command Handler.
- **How it works:** We write rules using `FluentValidation` (e.g., `RuleFor(x => x.Title).NotEmpty()`). We have a MediatR pipeline behavior (`ValidationBehavior`) that intercepts the request, runs the validators, and throws a `ValidationException` if it fails. **You do not need to manually check `ModelState.IsValid` in controllers.**

### Global Exception Handling
- **What it is:** A centralized way to handle errors and format API responses.
- **How it works:** The `ExceptionMiddleware` in the API project wraps the HTTP request. If a handler throws a `NotFoundException` or `BusinessRuleException`, the middleware catches it and maps it to a `404 Not Found` or `409 Conflict` HTTP response automatically using our standard `ApiResponse<T>` wrapper.

### DateTime vs DateTimeOffset
- **What & How:** We **strictly** use `DateTimeOffset` across the entire solution. This prevents timezone ambiguity, maps natively to SQL Server `datetimeoffset`, and serializes perfectly to standard ISO-8601 for the frontend.

---

## 6. Directory Structure: What Each Folder Does

### API/
- **`Common/`**: Contains the standard `ApiResponse<T>` envelope that all endpoints return.
- **`Controllers/`**: Thin HTTP endpoints. Grouped by feature (e.g., `EventsController`). They inherit from `BaseApiController` which provides helpers for standard responses.
- **`Extensions/`**: Extension methods for `IServiceCollection` to keep `Program.cs` clean (e.g., `AddDatabaseServices`).
- **`Middleware/`**: Contains `ExceptionMiddleware` for global error handling.
- **`Services/`**: API-specific implementations of application interfaces (e.g., `CurrentUserService` to read the JWT, `IdentityService` for ASP.NET Identity interactions).

### Application/
- **`Core/`**: Cross-cutting application concerns.
  - `Exceptions/`: Custom exceptions (`NotFoundException`, `BusinessRuleException`).
  - `Interfaces/`: Abstractions implemented by outer layers.
  - `Pagination/`: Standardized classes for paginated requests/responses.
  - `ValidationBehavior.cs`: The MediatR interceptor for validation.
- **Feature Folders (`Events/`, `Organizations/`, `Categories/`, etc.)**: This is a **Vertical Slice Architecture** approach. Instead of organizing by technical type (all handlers in one folder, all DTOs in another), we organize by feature. 
  - Inside a feature folder, you'll find `Commands`, `Queries`, and `DTOs` specific to that domain feature.

### Domain/
- **Entities (Root folder)**: C# classes mapping to database tables (`Event.cs`, `Organization.cs`). They contain properties and rich domain methods (like `ChangeStatus()`).
- **`Constants/`**: Hardcoded domain constants like `PermissionConstants`, `RoleConstants`, and `ApiRouteConstants` (centralizing API route strings to prevent typos).

### Persistence/
- **`AppDBContext.cs`**: Our Entity Framework Core context. Inherits from ASP.NET Identity's context. Manages `DbSets` and configures soft-delete query filters.
- **`DBInitializer.cs`**: Logic to automatically apply pending migrations and seed default data (like roles and admin users) on startup.
- **`SqlConnectionFactory.cs`**: For cases where we might need raw Dapper queries (e.g., complex read-only queries), this factory provides raw DB connections.

---

## 7. Getting Started Checklist

1. Review a simple Query flow (e.g., `GetOrganizationByIdQuery` and its Handler in the `Application` layer).
2. Review a Command flow with Validation (e.g., `CreateOrganizationCommand` and `CreateOrganizationCommandValidator`).
3. Look at `EventsController.cs` to see how thin the controller is when dispatching to MediatR.
4. Run the API (`dotnet run` in the API folder). It will auto-migrate and seed the local SQL Server database.

Welcome to the team!
