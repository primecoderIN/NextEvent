using Microsoft.EntityFrameworkCore;
using MassTransit;
using NextEvent.Modules.Organizations.Domain;
using NextEvent.Modules.Identity.Domain;

namespace NextEvent.Modules.Organizations.Persistence.Contexts;

/// <summary>
/// Database context for the Organizations module.
/// Owns: Organization, OrganizationMember, OrganizationRole,
///       OrganizationRolePermission, OrganizationMemberRole, Permission.
/// Uses schema "org" to isolate from other modules.
/// User entity is mapped read-only to "identity.AspNetUsers" (ExcludeFromMigrations)
/// so EF can model FK relationships without owning the table.
/// </summary>
public class OrganizationsDbContext(DbContextOptions<OrganizationsDbContext> options)
    : DbContext(options)
{

    // ── Organizations ────────────────────────────────────────────────────
    public DbSet<Organization> Organizations { get; set; } = null!;
    public DbSet<OrganizationMember> OrganizationMembers { get; set; } = null!;
    public DbSet<OrganizationMemberRole> OrganizationMemberRoles { get; set; } = null!;
    public DbSet<OrganizationRole> OrganizationRoles { get; set; } = null!;
    public DbSet<OrganizationRolePermission> OrganizationRolePermissions { get; set; } = null!;
    public DbSet<Permission> Permissions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Define module-specific schema ("org") to isolate tables in SQL Server
        builder.HasDefaultSchema("org");

        // Map User entity to "identity.AspNetUsers" for foreign key modeling.
        // ExcludeFromMigrations() tells EF Core that this DbContext can reference User for FK navigation
        // properties (e.g. Organization.Owner), but MUST NOT generate a duplicate CREATE TABLE script
        // in this module's migrations (since identity.AspNetUsers is created and owned by IdentityDbContext).
        builder.Entity<User>().ToTable("AspNetUsers", "identity", t => t.ExcludeFromMigrations());

        // MassTransit Outbox tables for guaranteed asynchronous event delivery across modules
        builder.AddInboxStateEntity();
        builder.AddOutboxMessageEntity();
        builder.AddOutboxStateEntity();

        // Automatically discover and apply all IEntityTypeConfiguration<T> classes in this assembly
        builder.ApplyConfigurationsFromAssembly(typeof(OrganizationsDbContext).Assembly);
    }
}
