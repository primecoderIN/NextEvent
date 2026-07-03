Current Architecture

This is a layered Clean Architecture style backend with CQRS:

API -> Application -> Domain
API -> Persistence -> Application -> Domain

The solution has four backend projects:

- API
- Application
- Domain
- Persistence

Project dependencies are currently:

- API references Application and Persistence
- Application references Domain
- Persistence references Domain and Application
- Domain references no project, but it does reference ASP.NET Identity packages


Runtime Composition

Program.cs is the composition root. It wires:

- AddApiServices()
- AddDatabaseServices()
- AddApplicationServices()
- AddSwaggerServices()
- AddIdentityServices()

Then it maps controllers, runs EF migrations, and seeds data at app startup.

Important detail:
Startup currently does database migration and seeding directly at app boot using AppDBContext, RoleManager, and UserManager.


Backend Feature Areas

The main backend features are:

- Events
- Identity / Authentication
- AI assistance
- Shared API behavior
- Persistence

Events:
Events is the core business module. It has CRUD endpoints in EventsController.cs, CQRS commands/queries under Application/Events, and the Event entity in Domain/Event.cs.

Identity / Authentication:
Identity owns register, login, refresh token, and logout. The HTTP surface is AccountController.cs, application logic is under Application/Authentication, and the user model is Domain/User.cs.

AI assistance:
AI owns event description generation and category suggestion. Its API surface is AiController.cs, but its service interface and implementation currently live in API/Services.

Shared API behavior:
Shared behavior includes ApiResponse, BaseApiController, ExceptionMiddleware, validation behavior, pagination, and custom exceptions.

Persistence:
Persistence is centralized in AppDBContext.cs. It inherits from IdentityDbContext<User> and also exposes DbSet<Event>.


Key Coupling To Notice

The app is cleanly layered, but not modular yet.

The biggest coupling points before migration are:

- IAppDBContext exposes DbSet<Event>, so Application/Core knows about Events.
- AppDBContext mixes Identity and Events persistence.
- Program.cs directly knows database migration and seeding details.
- AI service is registered as an application service but implemented in API.
- Domain.User inherits IdentityUser, so Domain is not fully framework-independent.
- Application uses both EF abstraction and Dapper query abstraction.
- Global usings hide several dependencies.

None of these are bad for the current app. They are just the places to handle carefully during modular monolith migration.


What To Verify Before Migration

Run:

dotnet build

Also verify these flows manually or through tests:

Events:
- GET /api/events
- GET /api/events/{id}
- POST /api/events
- PUT /api/events/{id}
- DELETE /api/events/{id}

Authentication:
- POST /api/account/register
- POST /api/account/login
- POST /api/account/refresh-token
- POST /api/account/logout

AI:
- POST /api/ai/generate-description
- POST /api/ai/suggest-category

Check configuration:

- DefaultConnection exists and points to the expected SQL Server database.
- TokenKey exists.
- OpenAI configuration exists if AI endpoints are tested.
- CORS origin http://localhost:3001 matches your frontend dev server.


Suggested Module Ownership

Events owns:
- Event
- event DTOs
- event commands/queries
- event validation
- event routes

Identity owns:
- User
- auth commands
- token generation
- Identity setup
- auth routes

AI owns:
- OpenAI integration
- AI routes

Shared owns:
- ApiResponse
- exceptions
- pagination
- validation pipeline
- middleware-style cross-cutting behavior

Persistence:
- Keep one database at first.


Best First Migration Move

Add module registration skeletons while leaving files where they are.

This lets you learn the modular shape without immediately fighting namespace and dependency breakage.