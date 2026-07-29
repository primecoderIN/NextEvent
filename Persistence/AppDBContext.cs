using Microsoft.EntityFrameworkCore;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Application.Core.Interfaces;

namespace Persistence;

// Implementing IAppDBContext allows the Application layer to use the DB 
// without directly referencing Entity Framework or the Persistence project.
public class AppDBContext(DbContextOptions options) : IdentityDbContext<User>(options), IAppDBContext //Whatever options we passed from program.cs has to be passed to DbContext
{
    public DbSet<Event> Events { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<CategorySuggestion> CategorySuggestions { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OrganizationMember> OrganizationMembers { get; set; }

    public DbSet<Permission> Permissions { get; set; }
    public DbSet<OrganizationRole> OrganizationRoles { get; set; }
    public DbSet<OrganizationRolePermission> OrganizationRolePermissions { get; set; }
    public DbSet<OrganizationMemberRole> OrganizationMemberRoles { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ApplyConfigurationsFromAssembly scans the given assembly using reflection,
        // finds every class that implements IEntityTypeConfiguration<T>,
        // and calls ApplyConfiguration() on each one automatically.
        //
        // Without this, we'd have to register every configuration class manually:
        //   modelBuilder.ApplyConfiguration(new EventConfiguration());
        //   modelBuilder.ApplyConfiguration(new CategoryConfiguration());
        //   ... one line per entity, forever.
        //
        // typeof(AppDBContext).Assembly resolves to the compiled Persistence.dll —
        // the same assembly where all Configurations/ classes live.
        // Any type from the same project would work (e.g. typeof(EventConfiguration).Assembly),
        // but AppDBContext is the most meaningful anchor since the context and its
        // configurations always belong together.
        //
        // Key benefit: when a new entity is added, just create its IEntityTypeConfiguration<T>
        // class and this line picks it up automatically — OnModelCreating never needs to change.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDBContext).Assembly);
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        // Enforce DateTimeKind.Utc on ALL DateTime properties system-wide automatically
        configurationBuilder
            .Properties<DateTime>()
            .HaveConversion<UtcDateTimeConverter>();
    }
}

public class UtcDateTimeConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>
{
    public UtcDateTimeConverter()
        : base(
            v => v,
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
    {
    }
}
