using Application.Core;
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

        // Register IHttpContextAccessor to make the current HTTP context available to services.
        // By default, only controllers have direct access to HttpContext. This registration
        // allows non-controller services (like CurrentUserService) to access the current request's
        // User claims, headers, and other HTTP details through dependency injection.
        // This is essential for implementing ICurrentUserService without coupling it directly to controllers.
        services.AddHttpContextAccessor();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;

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

        // Register the application-level abstraction for Identity role assignment.
        // Keeps the Application layer free of direct UserManager dependencies.
        services.AddScoped<IIdentityService, IdentityService>();
        
        // Register the centralized organization authorization service
        services.AddScoped<IOrganizationAuthorizationService, Application.Core.Services.OrganizationAuthorizationService>();

        // Register the centralized membership service for querying OrganizationMembers
        services.AddScoped<IOrganizationMemberService, Application.Core.Services.OrganizationMemberService>();

        return services;
    }
}
