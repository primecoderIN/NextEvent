using Application.Core.Interfaces;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures all infrastructure-level database services.
/// This includes setting up the Entity Framework Core DbContext with the appropriate 
/// provider (e.g., SQLite) and registering the application's database interfaces.
/// </summary>
public static class DatabaseServiceExtensions
{
    public static IServiceCollection AddDatabaseServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDBContext>(options =>
        {
            options.UseSqlServer(config.GetConnectionString("DefaultConnection"));
        });

        services.AddScoped<IAppDBContext>(provider => provider.GetRequiredService<AppDBContext>());
        
        // Register the ISqlConnectionFactory so query handlers can inject it to use Dapper for fast reads.
        services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

        return services;
    }
}
