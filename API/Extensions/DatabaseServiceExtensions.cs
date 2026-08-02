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
                // Instructs EF Core to look for database migration files within the specific module's assembly, keeping modules isolated.
                sqlOptions.MigrationsAssembly(migrationsAssembly);

                // Connection Resiliency: Automatically intercepts transient network blips or DB failovers and retries the query up to 5 times instead of crashing.
                sqlOptions.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: null);
                
                // By default, if a SQL query takes longer than 30 seconds to run, EF Core will cancel it and throw a Timeout Exception.
                sqlOptions.CommandTimeout(60);
            });
        }

        // We configure all three DbContexts and tell ef core to look for migration file in provided folder.
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
