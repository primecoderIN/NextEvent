using System.Text;
using NextEvent.Modules.Identity.Application.Authentication.Interfaces;
using NextEvent.Modules.Identity.Application.Services;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Modules.Identity.Persistence;
using NextEvent.Shared.Constants;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions;

/// <summary>
/// Responsibility: Configures Security, Authentication, and Identity Management.
/// This includes setting up ASP.NET Core Identity (Users, Roles, Store), JWT token generation,
/// and incoming JWT Bearer authentication validation parameters.
/// </summary>
public static class IdentityServiceExtensions
{
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddIdentityCore<User>(opt =>
        {
            opt.Password.RequireNonAlphanumeric = false;
            opt.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<IdentityDbContext>(); // Use Identity module's DbContext

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(opt =>
            {
                var tokenKey = config["TokenKey"] ?? throw new Exception("TokenKey not found");
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy("ActiveOrganizer", policy =>
            {
                policy.RequireRole(RoleConstants.Organizer);
                policy.RequireClaim("ActiveProfile", "Organizer");
            });
        });

        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}
