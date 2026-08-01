using Microsoft.EntityFrameworkCore;
using MassTransit;
using NextEvent.Modules.Events.Domain;
using Event = NextEvent.Modules.Events.Domain.Event;
using NextEvent.Modules.Identity.Domain;

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
        builder.HasDefaultSchema("evt");

        builder.Entity<User>().ToTable("AspNetUsers", "identity", t => t.ExcludeFromMigrations());

        // MassTransit Outbox tables for guaranteed message delivery
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();
    }
}
