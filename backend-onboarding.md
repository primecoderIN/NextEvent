# 🚀 Backend Onboarding Guide: NextEvent

Welcome to the NextEvent backend! If you are a new developer coming from another language (like TypeScript/Node.js, Python, or Go), this guide will help you understand our C#/.NET backend so you can start shipping features immediately.

---

## 1. The Ecosystem: C# and .NET
NextEvent is built on **.NET 8+** using **C#**. 
If you are coming from Node.js or Python, here are the key differences:
- **Compiled & Strongly Typed**: Code must be built (`dotnet build`) before it runs. Types are strictly enforced at compile time.
- **Dependency Injection (DI) is First-Class**: We don't manually instantiate services (`new MyService()`). Instead, we declare what we need in the class constructor, and the framework provides it automatically at runtime.
- **Async/Await Everywhere**: Just like JS/TS, but we use `Task` and `Task<T>` instead of `Promise`.

---

## 2. Our Architecture: The "Modular Monolith"

NextEvent is not a traditional monolith (where everything is dumped into one giant folder), nor is it a complex microservices cluster (where every feature is a separate repository). It is a **Modular Monolith**.

### What does this mean?
The backend is divided into vertical slices called **Modules** based on business features:
- `NextEvent.Modules.Events` (Handles creating events, categories, search)
- `NextEvent.Modules.Organizations` (Handles org profiles, roles, and permissions)
- `NextEvent.Modules.Identity` (Handles users, authentication, and JWTs)

**The Golden Rule of Modules:**
Modules **cannot** reference or talk to each other directly in code. For example, the `Events` module does not know the `Organizations` module exists. This prevents "spaghetti code" and makes it incredibly easy to break a module out into a separate microservice later if we get massive traffic.

### The Composition Root (`API` Project)
If modules can't talk to each other, how does the app run? 
The **`API`** project is the "brain" (Composition Root). It references all modules, wires them together using Dependency Injection, and starts the web server. When you want to run the app, you run the `API` project.

---

## 3. How We Write Code: CQRS Pattern

We use a pattern called **CQRS (Command Query Responsibility Segregation)**. Instead of having massive "Service" classes with 50 methods, we split every operation into a specific **Command** (write/mutate data) or a **Query** (read data).

We use a library called **MediatR** to dispatch these.

### A. The Read Side (Queries) -> Dapper & Raw SQL
When we want to fetch data (e.g., getting a list of events), we use **Dapper**.
- **Why?** It's insanely fast.
- **How it works:** You write raw SQL, and Dapper maps the SQL result directly to C# objects (DTOs).
- *Analogy:* It's like using `pg` or `mysql2` in Node.js instead of an ORM.

### B. The Write Side (Commands) -> EF Core
When we want to mutate data (Create, Update, Delete), we use **Entity Framework Core (EF Core)**.
- **Why?** It's our ORM. It handles complex relationships, data validation, transactions, and prevents SQL injection automatically.
- **How it works:** You modify C# objects, and call `DbContext.SaveChangesAsync()`. EF Core translates this into SQL `UPDATE`/`INSERT` statements.
- *Analogy:* Similar to Prisma or TypeORM in the TypeScript ecosystem.

---

## 4. Cross-Module Communication (RabbitMQ)

Since modules cannot call each other's databases directly, how do they communicate? 
**Asynchronously via RabbitMQ.**

If the `Organizations` module deletes an organization, it doesn't try to delete the events directly. Instead:
1. `Organizations` publishes a message to RabbitMQ: `"Hey, Organization X was deleted!"` (`IntegrationEvent`).
2. The `Events` module has a listener (Consumer) waiting for that specific message.
3. When `Events` receives the message, it deletes the events belonging to that organization.

**The Transactional Outbox Pattern:**
To ensure messages aren't lost if the server crashes mid-request, we save the message to our SQL database in the *exact same transaction* as our business data. A background worker then picks it up and sends it to RabbitMQ. We use a library called **MassTransit** to handle all of this automatically.

---

## 5. The Database Structure

We use a single SQL Server database, but we logically isolate the data using **Schemas**:
- `[identity].AspNetUsers`
- `[org].Organizations`
- `[evt].Events`

Each module has its own `DbContext` (Database connection manager) that only knows about its own schema.
*Note: When writing raw SQL queries using Dapper, you MUST include the schema prefix (e.g., `SELECT * FROM [evt].[Events]`).*

---

## 6. Step-by-Step: Building a New Feature

Imagine you need to create an endpoint to **Update an Event's Title**. Here is exactly what you would do:

### Step 1: Create the Command & Response (The Request Payload)
In `Modules/Events/Application/Events/Commands/UpdateEvent/`, create `UpdateEventCommand.cs`:
```csharp
// This is the data we receive from the controller
public record UpdateEventCommand(Guid EventId, string NewTitle) : IRequest<ApiResponse<Guid>>;
```

### Step 2: Create the Validator
In the same folder, create `UpdateEventCommandValidator.cs`. We use **FluentValidation** (similar to Zod or Joi):
```csharp
public class UpdateEventCommandValidator : AbstractValidator<UpdateEventCommand>
{
    public UpdateEventCommandValidator()
    {
        RuleFor(x => x.NewTitle).NotEmpty().MaximumLength(100);
    }
}
```

### Step 3: Create the Handler (The Business Logic)
Create `UpdateEventCommandHandler.cs`. This is where MediatR routes the command:
```csharp
public class UpdateEventCommandHandler(EventsDbContext context) 
    : IRequestHandler<UpdateEventCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch from EF Core
        var eventItem = await context.Events.FindAsync(request.EventId);
        if (eventItem == null) throw new NotFoundException("Event not found");

        // 2. Update state
        eventItem.Title = request.NewTitle;

        // 3. Save changes
        await context.SaveChangesAsync(cancellationToken);

        // 4. Return standard response wrapper
        return ApiResponse<Guid>.Success(eventItem.Id, "Event updated");
    }
}
```
*(Note the `(EventsDbContext context)` syntax at the top class definition—this is a C# 12 Primary Constructor injecting the database connection automatically!)*

### Step 4: Expose it in the Controller
In `Modules/Events/API/EventsController.cs`:
```csharp
[Route("api/events")]
public class EventsController(IMediator mediator) : BaseApiController(mediator)
{
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventRequest dto)
    {
        // Send the command to MediatR. It automatically finds the Handler!
        return Ok(await Mediator.Send(new UpdateEventCommand(id, dto.Title)));
    }
}
```

---

## 7. Key Takeaways for New Developers
1. **Never write business logic in Controllers.** Controllers just pass data to MediatR (`Mediator.Send`).
2. **Never cross module boundaries.** An `Events` handler cannot inject `OrganizationsDbContext`. 
3. **Use the `ApiResponse<T>` wrapper** for all returns so the frontend gets a predictable JSON structure (`{ data, success, message }`).
4. **Constructor Injection is mandatory.** Do not use `HttpContext.RequestServices`. Use Primary Constructors for cleaner code.
5. **Dapper for Reads, EF Core for Writes.**

Welcome to the team! 🎉
