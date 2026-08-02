namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Abstraction for retrieving the current authenticated user's identity.
/// This interface decouples the Application layer from HTTP concerns (HttpContext, ClaimsPrincipal),
/// following Clean Architecture principles. Handlers and services that need to know who the current
/// user is depend on this interface instead of directly accessing HttpContext.
/// </summary>
public interface ICurrentUserService
{
    /// <summary>
    /// Gets the unique identifier of the currently authenticated user.
    /// </summary>
    /// <returns>
    /// The user ID (e.g., ASP.NET Core Identity user ID). 
    /// Returns null if no user is authenticated.
    /// </returns>
    string? GetCurrentUserId();

    /// <summary>
    /// Gets the unique identifier of the user's active organization from their token.
    /// Returns null if the user does not have an active organization claim.
    /// </summary>
    Guid? GetCurrentUserOrganizationId();

    /// <summary>
    /// Checks if the current authenticated user has the specified role.
    /// </summary>
    bool HasRole(string role);
}

// The application layer shouldn't know how to get the user ID (HttpContext, claims, headers, etc.)
