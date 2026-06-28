// Required for OpenApiSecurityScheme, OpenApiSecurityRequirement, etc.
using Microsoft.OpenApi;
// Optional (provided by ImplicitUsings), but good practice for IServiceCollection
using Microsoft.Extensions.DependencyInjection;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures Swagger/OpenAPI generation services.
/// This isolates the setup for API documentation and UI testing endpoints.
/// </summary>
public static class SwaggerServiceExtensions
{
    public static IServiceCollection AddSwaggerServices(this IServiceCollection services)
    {
        services.AddSwaggerGen(options =>
        {
            var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
            var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
            options.IncludeXmlComments(xmlPath);

            // AddSecurityDefinition("Bearer", ...): This tells Swagger to use JWT Bearer authentication 
            // and displays the "Authorize" button at the top of the Swagger UI page.
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name         = "Authorization",
                Type         = SecuritySchemeType.Http,
                Scheme       = "Bearer",
                BearerFormat = "JWT",
                In           = ParameterLocation.Header,
                Description  = "Paste your JWT token here. Obtain it from POST /api/account/login or /register."
            });

            // AddSecurityRequirement(...): This applies the security definition globally, so whenever you 
            // execute a request from Swagger UI, it will automatically attach the Authorization: Bearer <token> header for you.
            options.AddSecurityRequirement(document =>
            {
                var requirement = new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                };
                return requirement;
            });
        });
        
        return services;
    }
}
