// using Application.Core;
using Application.Core.Interfaces;
using API.Services;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures services related to the API presentation layer.
/// This includes API endpoints exploration, routing rules, controller JSON serialization settings,
/// CORS policies, and application-level abstractions like ICurrentUserService.
/// </summary>
public static class ApiServiceExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddRouting(options =>
        {
            options.LowercaseUrls = true;
        });

        services.AddHttpContextAccessor();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                options.JsonSerializerOptions.Converters.Add(new UtcDateTimeJsonConverter());
            });

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                policy.AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithOrigins("http://localhost:3001");
            });
        });

        // Register the application-level abstraction for getting the current authenticated user.
        // This decouples handlers from HttpContext concerns.
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        return services;
    }
}
