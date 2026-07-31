namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Service to centralize authorization checks for operations performed within an Organization.
/// Evaluates the current user's membership status and assigned roles to determine permissions.
/// </summary>
public interface IOrganizationAuthorizationService
{
    /// <summary>
    /// Checks if the current authenticated user has the specified permission within the organization.
    /// Returns true if they have the permission, false otherwise.
    /// </summary>
    Task<bool> HasPermissionAsync(Guid organizationId, string permissionCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Evaluates if the current authenticated user has the specified permission within the organization.
    /// Throws a ForbiddenAccessException if the user does not have the permission.
    /// </summary>
    Task AuthorizeAsync(Guid organizationId, string permissionCode, CancellationToken cancellationToken = default);
}
