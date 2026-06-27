namespace API.Extensions;

/// <summary>
/// Responsibility: Configures Swagger/OpenAPI generation services.
/// This isolates the setup for API documentation and UI testing endpoints.
/// </summary>
public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddSwaggerGen();
        return services;
    }
}
