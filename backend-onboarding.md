# 🚀 The Ultimate Backend Onboarding & .NET Crash Course

Welcome to the NextEvent backend! This guide is written explicitly for developers coming from other ecosystems (like TypeScript/Node.js, Python, or Go). It will teach you the fundamentals of C# and .NET 8, and then dive deep into the specific architecture (Modular Monolith) and patterns we use in this project.

By the end of this document, you will understand exactly how data flows through this application and how to confidently build new features.

---

## Part 1: .NET & C# Crash Course (For the JS/Python Developer)

If you are used to dynamic languages, C# will feel a bit different. Here are the core concepts you need to grasp immediately.

### 1.1 The Runtime & Compilation
- **.NET** is the runtime framework (similar to the V8 engine in Node.js or the JVM).
- **C#** is the programming language.
- Unlike Node.js where you run a file directly (`node app.js`), C# is a **compiled language**. When you run `dotnet build`, your C# code is compiled into Intermediate Language (IL) binaries (`.dll` files). `dotnet run` executes them.
- **Projects & Solutions**: Code is grouped into "Projects" (`.csproj` files). A "Solution" (`.sln` file) is just a container that holds multiple projects together.

### 1.2 Strongly Typed & Object-Oriented
Everything in C# is a Class or a Record. Types are strictly enforced at compile time.
- **Records**: You will see a lot of `public record MyCommand(string Name);`. Records are immutable data structures (they cannot be changed after creation). They are perfect for Data Transfer Objects (DTOs) and MediatR Requests.

### 1.3 Dependency Injection (DI) - The Heart of .NET
In Node.js, you might `require()` a database connection pool in a file. **In .NET, you almost never manually instantiate services using `new`.**
Instead, .NET has a built-in Dependency Injection container.
1. You register a service when the app starts in `Program.cs` (or extension methods like `ApiServiceExtensions.cs`).
2. When you need that service, you simply ask for it in your class's constructor. The framework automatically passes it in!

We use **C# 12 Primary Constructors** to make this incredibly clean.

**Example: The Magic of `IHttpContextAccessor`**
If you look at `CurrentUserService.cs`, it needs access to the HTTP request to find the logged-in user:
```csharp
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    // It uses httpContextAccessor.HttpContext?.User behind the scenes!
}
```
You never call `new CurrentUserService(...)`. Instead, in `ApiServiceExtensions.cs`, we register it:
```csharp
services.AddHttpContextAccessor(); // Tells .NET how to provide IHttpContextAccessor
services.AddScoped<ICurrentUserService, CurrentUserService>(); // Tells .NET how to provide ICurrentUserService
```
When a controller asks for `ICurrentUserService`, the framework automatically builds `CurrentUserService`, automatically injects the `IHttpContextAccessor` into it, and hands the fully built object to the controller!

**Service Lifetimes (Crucial to understand):**
- **Transient**: A brand new instance is created every time it's injected.
- **Scoped**: One instance is created *per HTTP Request*. (This is how Database connections work. Everyone in the same API request shares the exact same DB connection).
- **Singleton**: One instance is created for the entire lifetime of the application (like a cache).

### 1.4 Async/Await & LINQ
- C# uses `async/await` heavily. Instead of `Promise<T>`, we use `Task<T>`.
- **LINQ (Language Integrated Query)** is C#'s superpower. It allows you to manipulate arrays/lists using SQL-like syntax built into the language. It replaces `array.map().filter()`.
  ```csharp
  // Node.js: const active = users.filter(u => u.isActive).map(u => u.name);
  // C# LINQ:
  var active = users.Where(u => u.IsActive).Select(u => u.Name).ToList();
  ```

---

## Part 2: Our Architecture - The "Modular Monolith"

Most enterprise applications are either standard Layered Monoliths (Onion/Clean Architecture) or Microservices. NextEvent is a **Modular Monolith**.

### 2.1 The Problem with Standard Monoliths
In a standard architecture, code is grouped by *technical layer*. You have a massive `Controllers` folder, a massive `Services` folder, and a massive `Database` folder. Over time, code gets tangled into "spaghetti," where the User system is tightly coupled to the Event system.

### 2.2 The Solution: Modules
We group code by **Business Feature (Bounded Contexts)** into completely isolated vertical slices called Modules:
- `NextEvent.Modules.Identity` (Users, Auth)
- `NextEvent.Modules.Organizations` (Orgs, Roles)
- `NextEvent.Modules.Events` (Events, Categories)

**The Golden Rule of NextEvent:**
> Modules **CANNOT** reference or call each other directly in C#. 

The `Events` module does not know that the `Organizations` module exists. If we ever experience massive traffic, we can literally copy-paste the `Events` folder into a new repository, and it immediately becomes an independent Microservice with zero code rewrites.

### 2.3 The Composition Root (`API` Project)
If modules can't talk to each other, how does the app run? 
The **`API`** project is the "brain" (Composition Root). It is the only project that is allowed to reference everything. It wires up Dependency Injection, starts the web server, and exposes the Swagger API documentation.

---

## Part 3: Database Strategy - CQRS (EF Core & Dapper)

We use a single SQL Server database, but data is isolated using **Schemas** (`[identity]`, `[org]`, `[evt]`). Each module has its own `DbContext` that only controls its specific schema.

To interact with the database, we use **CQRS (Command Query Responsibility Segregation)**. This means we use completely different tools for writing data vs reading data.

### 3.1 Write Side (Commands): Entity Framework Core (EF Core)
- **What it is**: The official Object-Relational Mapper (ORM) for .NET (similar to Prisma or TypeORM).
- **When to use**: Creating, Updating, or Deleting data.
- **Why**: It handles complex entity relationships, data validation, prevents SQL injection, and manages transactions flawlessly.
- **How**: You inject your module's DbContext, modify C# objects, and call `await context.SaveChangesAsync();`.

### 3.2 Read Side (Queries): Dapper (Raw SQL)
- **What it is**: A lightning-fast micro-ORM that maps raw SQL results directly to C# objects.
- **When to use**: Fetching data, paginated lists, or detailed views.
- **Why**: It is significantly faster than EF Core for reads. More importantly, it allows us to do **cross-schema SQL joins** (e.g., joining an Event in `[evt]` with an Organization in `[org]`) for the UI, without violating our strict C# domain boundaries!

---

## Part 4: Building Features with MediatR

NextEvent does not use giant "Service" classes. Instead, we use the **MediatR** library to dispatch operations.
MediatR is an in-memory message bus. A Controller simply says, "Here is a Command, find the exact class that knows how to handle this."

Let's walk through building a feature: **Updating an Event Title**.

### Step 1: The Command (The Payload)
We define a Record representing the data we want to process, and the type of response we expect (`ApiResponse<Guid>`).
```csharp
// Modules/Events/Application/Events/Commands/UpdateEventCommand.cs
public record UpdateEventCommand(Guid EventId, string NewTitle) : IRequest<ApiResponse<Guid>>;
```

### Step 2: The Validator (FluentValidation)
Before MediatR executes our business logic, a validation pipeline intercepts the command. We use **FluentValidation** (similar to Zod or Joi).
```csharp
public class UpdateEventCommandValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventCommandValidator()
    {
        RuleFor(x => x.NewTitle).NotEmpty().MaximumLength(100);
    }
}
```
> **Note on Architecture:** MediatR and FluentValidation are completely separate libraries created by different teams. MediatR knows nothing about your validators! We bridge this gap in `ApplicationServiceExtensions.cs` by registering a MediatR "Pipeline Behavior" (`ValidationBehavior`). This middleware tells MediatR: *"Before executing the handler, check the DI container for any FluentValidation rules that match this command, and run them first."*

### Step 3: The Handler (The Business Logic)
This is where the actual work happens. MediatR routes the command here.
```csharp
// 1. Primary Constructor injects the Database Context
public class UpdateEventCommandHandler(EventsDbContext context) 
    : IRequestHandler<UpdateEventCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateEventCommand request, CancellationToken ct)
    {
        // 2. Fetch the entity using EF Core
        var eventItem = await context.Events.FindAsync(request.EventId);
        if (eventItem == null) throw new NotFoundException("Event not found");

        // 3. Mutate State
        eventItem.Title = request.NewTitle;

        // 4. Save Changes to Database
        await context.SaveChangesAsync(ct);

        // 5. Return our standard JSON wrapper
        return ApiResponse<Guid>.Success(eventItem.Id, "Updated successfully");
    }
}
```

### Step 4: The API Controller
Because MediatR handles the routing, our Controllers are incredibly thin—usually just one line of code!
```csharp
[Route("api/events")]
public class EventsController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateEvent(Guid id, [FromBody] UpdateDto dto)
    {
        // Controller just passes the data to MediatR
        return Ok(await Mediator.Send(new UpdateEventCommand(id, dto.Title)));
    }
}
```

---

## Part 5: Cross-Module Communication (RabbitMQ & MassTransit)

Since modules are forbidden from calling each other's databases, what happens when an action in one module affects another?
**Example**: If the `Organizations` module deletes an organization, the `Events` module must delete all associated events.

We solve this using **Asynchronous Integration Events via RabbitMQ**.

### 5.1 Publishing an Event
When an organization is deleted, the `Organizations` module publishes an event using **MassTransit** (our message broker library):
```csharp
await _publishEndpoint.Publish(new OrganizationDeletedIntegrationEvent(orgId));
```

### 5.2 The Transactional Outbox Pattern (Critical Concept)
What happens if the database saves the deletion, but the RabbitMQ server crashes before the message is sent? The system would be permanently out of sync.

To prevent this, NextEvent uses the **Transactional Outbox Pattern**:
1. When you call `.Publish()`, MassTransit does NOT send the message to RabbitMQ.
2. Instead, it saves the message into a local SQL table (`[org].[OutboxMessages]`) inside the *exact same SQL transaction* as the database changes.
3. If the database transaction succeeds, a background worker instantly reads the table and forwards the message to RabbitMQ. Guaranteed delivery!

### 5.3 Consuming the Event
The `Events` module has a Consumer class listening to RabbitMQ for that specific event:
```csharp
public class OrganizationDeletedConsumer(EventsDbContext context) 
    : IConsumer<OrganizationDeletedIntegrationEvent>
{
    public async Task Consume(ConsumeContext<OrganizationDeletedIntegrationEvent> ctx)
    {
        var orgId = ctx.Message.OrganizationId;
        // Logic to delete events associated with this org
        // ...
    }
}
```

---

## 6. Summary: Rules for Backend Developers
1. **Never write business logic in Controllers.** Controllers exist only to route HTTP requests to MediatR.
2. **Never cross module boundaries.** An `Events` handler cannot inject `OrganizationsDbContext`. Use Integration Events (RabbitMQ) or cross-schema Dapper SQL for reads.
3. **Use the `ApiResponse<T>` wrapper** for all returns so the frontend client gets a predictable JSON structure (`{ data, success, message }`).
4. **Constructor Injection is mandatory.** Do not use the service locator anti-pattern (`HttpContext.RequestServices`). Use C# 12 Primary Constructors for cleaner code.
5. **Dapper for Reads, EF Core for Writes.**
6. **Always use CancellationToken.** Pass `ct` or `cancellationToken` down to all database calls (`ToListAsync(ct)`, `SaveChangesAsync(ct)`) so long-running queries cancel if the user closes their browser.
7. **Never call `HasPermissionAsync` from raw DB queries.** It is already cache-first via Redis — injecting `IOrganizationAuthorizationService` is sufficient. Do not duplicate the permission join.

Welcome to the team! 🎉 You are now equipped to build scalable features in NextEvent.

---

## Part 7: Redis Permission Cache (PERF-01)

### The Problem
Every command that checks whether a user can perform an action in an organization (create events, invite members, update roles) previously ran a **4-level SQL JOIN**:

```
OrganizationMembers → MemberRoles → OrganizationRoles → RolePermissions → Permissions
```

This hit the database on **every authenticated mutating request**.

### The Solution: Redis Distributed Cache
`OrganizationAuthorizationService` is now **cache-first**:
1. Check Redis for `perm:{userId}:{orgId}` — if HIT, return immediately (no DB).
2. On MISS, run the 4-level join, store the result in Redis with a **5-minute TTL**.
3. When a role's permissions change (`UpdateOrganizationRole`), all cached entries for that org are immediately evicted.

### Infrastructure
Redis runs as a Docker container defined in `docker-compose.yml`:
```bash
# Start Redis (and RabbitMQ)
docker-compose up -d

# Verify Redis is running
docker exec nextevent-redis redis-cli PING   # → PONG
```

Configuration in `appsettings.Development.json`:
```json
"Redis": {
  "ConnectionString": "localhost:6379"
}
```

### Key Abstractions

| Interface | Where | What it does |
|---|---|---|
| `IPermissionCacheService` | `Shared/Interfaces/` | `GetPermissionsAsync`, `SetPermissionsAsync`, `InvalidateOrganizationAsync` |
| `RedisPermissionCacheService` | `Modules/Organizations/.../Services/` | Production Redis implementation |

### Writing a New Permission-Guarded Handler
You do not need to touch the cache yourself. Just inject `IOrganizationAuthorizationService` and call `AuthorizeAsync` as usual:

```csharp
public class MyNewCommandHandler(
    EventsDbContext context,
    IOrganizationAuthorizationService authorizationService)
    : IRequestHandler<MyNewCommand>
{
    public async Task Handle(MyNewCommand request, CancellationToken ct)
    {
        // This is cache-first — Redis is checked before the DB join runs.
        await authorizationService.AuthorizeAsync(
            request.OrganizationId,
            PermissionConstants.EventsCreate,
            ct);

        // ... your handler logic
    }
}
```

### Testing Without Redis
In test projects, register an in-memory distributed cache:
```csharp
services.AddDistributedMemoryCache();
services.AddSingleton<IConnectionMultiplexer>(Substitute.For<IConnectionMultiplexer>());
services.AddScoped<IPermissionCacheService, RedisPermissionCacheService>();

// Or mock IPermissionCacheService entirely to force a DB path:
var cache = Substitute.For<IPermissionCacheService>();
cache.GetPermissionsAsync(default!, default).ReturnsForAnyArgs((IReadOnlySet<string>?)null);
```
