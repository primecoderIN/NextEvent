using Microsoft.EntityFrameworkCore;
using MassTransit;
using NextEvent.Modules.Events.Domain;
using Event = NextEvent.Modules.Events.Domain.Event;
using NextEvent.Modules.Identity.Domain;
using Organization = NextEvent.Modules.Organizations.Domain.Organization;

namespace NextEvent.Modules.Events.Persistence.Contexts;

/// <summary>
/// Database context for the Events module.
/// Owns: Event, Category, CategorySuggestion.
/// Uses schema "evt" to isolate from other modules.
/// </summary>
public class EventsDbContext(DbContextOptions<EventsDbContext> options)
    : DbContext(options)
{

    // ── Events ───────────────────────────────────────────────────────────
    public DbSet<Event> Events { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<CategorySuggestion> CategorySuggestions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Define module-specific schema ("evt") to isolate tables in SQL Server
        builder.HasDefaultSchema("evt");

        // Map User entity to "identity.AspNetUsers" for foreign key modeling.
        // ExcludeFromMigrations() tells EF Core that this DbContext can reference User for FK navigation
        // properties, but MUST NOT generate a duplicate CREATE TABLE script in this module's migrations.
        builder.Entity<User>().ToTable("AspNetUsers", "identity", t => t.ExcludeFromMigrations());

        // Map Organization entity to "org.Organizations" for foreign key modeling.
        // ExcludeFromMigrations() tells EF Core that this DbContext can reference Organization for FK navigation
        // properties (e.g. Event.Organization), but MUST NOT generate a duplicate CREATE TABLE script in this module's migrations.
        builder.Entity<Organization>().ToTable("Organizations", "org", t => t.ExcludeFromMigrations());

        // MassTransit Outbox tables for guaranteed asynchronous event delivery across modules
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();

        // Automatically discover and apply all IEntityTypeConfiguration<T> classes in this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(EventsDbContext).Assembly);
    }
}
