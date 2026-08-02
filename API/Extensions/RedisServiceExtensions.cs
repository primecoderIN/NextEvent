using NextEvent.Modules.Organizations.Application.Organizations.Services;
using NextEvent.Shared.Interfaces;
using StackExchange.Redis;

namespace API.Extensions;

/// <summary>
/// Responsibility: Registers Redis as the distributed cache provider and wires up
/// the IPermissionCacheService abstraction used by OrganizationAuthorizationService.
///
/// In development  → connects to the Docker Redis container (localhost:6379).
/// In production   → the connection string is supplied via environment variable or secrets.
/// In tests        → swap IDistributedCache for AddDistributedMemoryCache() without touching this class.
/// </summary>
public static class RedisServiceExtensions
{
    public static IServiceCollection AddRedisServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration["Redis:ConnectionString"]
            ?? throw new InvalidOperationException(
                "Redis:ConnectionString is not configured. " +
                "Add it to appsettings.Development.json or set the REDIS__CONNECTIONSTRING environment variable.");

        // Register IConnectionMultiplexer (StackExchange.Redis) as a singleton.
        // The multiplexer is thread-safe and designed to be shared across the whole app lifetime.
        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(connectionString));

        // Register IDistributedCache → Redis.
        // Used by RedisPermissionCacheService for individual cache entry GET/SET/REMOVE operations.
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = connectionString;
            options.InstanceName  = "NextEvent:"; // Namespace prefix on all keys
        });

        // Register the permission cache abstraction.
        // Scoped because ICurrentUserService (injected downstream) is Scoped.
        services.AddScoped<IPermissionCacheService, RedisPermissionCacheService>();

        return services;
    }
}
