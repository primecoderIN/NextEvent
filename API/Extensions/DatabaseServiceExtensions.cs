using Application.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence;

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
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' was not found.");

        services.AddDbContext<AppDBContext>(options =>
        {
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                // Migrations are stored in the Persistence project.
                //It tells EF Core: "Even though you're running from API, the migrations live in Persistence."
                sqlOptions.MigrationsAssembly(typeof(AppDBContext).Assembly.GetName().Name);

                // Automatically retry transient SQL Server failures.
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorNumbersToAdd: null);

                // Allow long-running operations such as migrations,
                // imports, and complex reports.
                sqlOptions.CommandTimeout(60);
            });
        });

        // Expose AppDBContext via the IAppDBContext abstraction for application layer usage.
        services.AddScoped<IAppDBContext>(provider => provider.GetRequiredService<AppDBContext>());

        // Register ISqlConnectionFactory so query handlers can inject it for fast Dapper reads.
        services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

        return services;
    }
}
