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

        // Define module-specific schema
        builder.HasDefaultSchema("identity");

        // Add MassTransit Outbox configuration
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();

        // Apply all entity configurations in this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(IdentityDbContext).Assembly);
    }
}
