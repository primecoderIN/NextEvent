using System.Security.Claims;
using Application.Core.Interfaces;

namespace API.Services;

/// <summary>
/// API-layer implementation of ICurrentUserService.
/// Extracts the current user's ID from the HttpContext's User ClaimsPrincipal,
/// following the standard ASP.NET Core pattern of storing the user ID in the NameIdentifier claim.
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
}
