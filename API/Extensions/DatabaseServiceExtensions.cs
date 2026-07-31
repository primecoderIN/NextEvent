using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Persistence;
using NextEvent.Modules.Identity.Persistence;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Modules.Events.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures all infrastructure-level database services.
/// This includes setting up the Entity Framework Core DbContext with the appropriate
/// provider (SQL Server) and registering the application's database interfaces.
/// </summary>
public static class DatabaseServiceExtensions
{
    public static IServiceCollection AddDatabaseServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

        void ConfigureSqlOptions(DbContextOptionsBuilder options, string migrationsAssembly)
        {
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(migrationsAssembly);
                sqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
                sqlOptions.CommandTimeout(60);
            });
        }

        // We configure all three DbContexts.
        services.AddDbContext<IdentityDbContext>(options => ConfigureSqlOptions(options, "NextEvent.Modules.Identity"));
        services.AddDbContext<OrganizationsDbContext>(options => ConfigureSqlOptions(options, "NextEvent.Modules.Organizations"));
        services.AddDbContext<EventsDbContext>(options => ConfigureSqlOptions(options, "NextEvent.Modules.Events"));

        // Register ISqlConnectionFactory so query handlers can inject it for fast Dapper reads.
        services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

        // Register Dapper Type Handler globally to enforce DateTimeKind.Utc
        Dapper.SqlMapper.AddTypeHandler(new NextEvent.Shared.Persistence.DapperTypeHandlers.UtcDateTimeHandler());
        Dapper.SqlMapper.AddTypeHandler(new NextEvent.Shared.Persistence.DapperTypeHandlers.NullableUtcDateTimeHandler());

        return services;
    }
}
