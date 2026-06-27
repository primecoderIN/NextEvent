using Application.Core;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures services related to the API presentation layer.
/// This includes API endpoints exploration, routing rules, controller JSON serialization settings,
/// and Cross-Origin Resource Sharing (CORS) policies.
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

        return services;
    }
}
