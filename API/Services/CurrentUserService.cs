using System.Security.Claims;
using Application.Core.Interfaces;

namespace API.Services;

/// <summary>
/// API-layer implementation of ICurrentUserService.
/// Extracts the current user's ID from the HttpContext's User ClaimsPrincipal,
/// following the standard ASP.NET Core pattern of storing the user ID in the NameIdentifier claim.
/// 
/// Note: Depends on IHttpContextAccessor (registered via AddHttpContextAccessor() in Startup).
/// This allows the Application layer to access HTTP context through an abstraction,
/// keeping it decoupled from direct HttpContext dependencies while remaining testable and reusable.
/// </summary>
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public string? GetCurrentUserId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        if (user?.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        // NameIdentifier claim contains the user ID in ASP.NET Core Identity by default.
        // If a custom user ID claim is used, update this accordingly.
        return user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    public Guid? GetCurrentOrganizationId()
    {
        var user = httpContextAccessor.HttpContext?.User;
        var orgIdClaim = user?.FindFirst("OrganizationId")?.Value;
        
        if (Guid.TryParse(orgIdClaim, out var orgId))
        {
            return orgId;
        }

        return null;
    }

    public bool HasRole(string role)
    {
        var user = httpContextAccessor.HttpContext?.User;
        return user?.IsInRole(role) == true;
    }
}
