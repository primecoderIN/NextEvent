using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Modules.Identity.Application.Services;
using NextEvent.Modules.Organizations.Application.Organizations.Services;
using API.Services;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures services related to the API presentation layer.
/// This includes API endpoints exploration, routing rules, controller JSON serialization settings,
/// CORS policies, and application-level abstractions like ICurrentUserService.
/// </summary>
public static class ApiServiceExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddEndpointsApiExplorer();

        services.AddRouting(options =>
        {
            options.LowercaseUrls = true;
        });

        // Register IHttpContextAccessor to make the current HTTP context available to services.
        services.AddHttpContextAccessor();

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase; //Use camel case for JSON property names in response
                options.JsonSerializerOptions.PropertyNameCaseInsensitive = true; //Accept any case of property names in request body

            });

        // CORS origins are read from configuration so the same binary can serve
        // different environments (dev / staging / prod) without recompilation.
        var allowedOrigins = configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", policy =>
            {
                policy.AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .WithOrigins(allowedOrigins);
            });
        });

        // Register the application-level abstraction for getting the current authenticated user.
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Register the application-level abstraction for Identity role assignment.
        services.AddScoped<IIdentityService, IdentityService>();
        
        // Register the centralized organization authorization service
        services.AddScoped<IOrganizationAuthorizationService, OrganizationAuthorizationService>();

        // Register the centralized membership service for querying OrganizationMembers
        services.AddScoped<IOrganizationMemberService, OrganizationMemberService>();



        return services;
    }
}
