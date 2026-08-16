using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.RateLimiting;

namespace API.Extensions;

public static class RateLimiterServiceExtensions
{
    public static IServiceCollection AddRateLimiterServices(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            
            options.AddPolicy("Auth", httpContext =>
            {
                // Rate limit based on the client IP address. 
                // In production behind a proxy (like Nginx/Cloudflare), ensure Forwarded Headers are configured.
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(ipAddress, partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 5,
                    Window = TimeSpan.FromMinutes(1)
                });
            });

            // Rate limit policy for reporting events to prevent spam/abuse.
            // Limits users (or IPs if unauthenticated, though this endpoint requires auth) to 10 reports per 10 minutes.
            options.AddPolicy("Reports", httpContext =>
            {
                var userId = httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var partitionKey = userId ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                return RateLimitPartition.GetFixedWindowLimiter(partitionKey, partition => new FixedWindowRateLimiterOptions
                {
                    AutoReplenishment = true,
                    PermitLimit = 10,
                    Window = TimeSpan.FromMinutes(10)
                });
            });
        });

        return services;
    }
}
