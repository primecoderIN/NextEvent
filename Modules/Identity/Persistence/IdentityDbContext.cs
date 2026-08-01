using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Identity.Persistence;

/// <summary>
/// Identity module database context.
/// Owns: ASP.NET Core Identity tables (Users, Roles, UserRoles, etc.)
/// Uses schema "identity" to isolate from other modules.
/// </summary>
public class IdentityDbContext(DbContextOptions<IdentityDbContext> options)
    : IdentityDbContext<User>(options)
{

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Define module-specific schema ("identity") to isolate ASP.NET Core Identity tables
        builder.HasDefaultSchema("identity");

        // MassTransit Outbox tables for guaranteed asynchronous event delivery across modules
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();

        // Automatically discover and apply all IEntityTypeConfiguration<T> classes in this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
    }
}
