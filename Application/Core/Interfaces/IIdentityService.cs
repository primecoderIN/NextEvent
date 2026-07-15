namespace Application.Core.Interfaces;

/// <summary>
/// Abstraction over ASP.NET Core Identity role assignment.
/// Keeps the Application layer free of Identity package references
/// while still allowing handlers to assign platform-level roles.
/// Implemented in the API layer by <c>IdentityService</c>.
/// </summary>
public interface IIdentityService
{
    /// <summary>
    /// Assigns the given ASP.NET Identity role to a user.
    /// No-ops silently if the user already holds the role.
    /// Throws <see cref="Application.Core.Exceptions.BusinessRuleException"/>
    /// if the user does not exist or the role is unknown.
    /// </summary>
    Task AssignRoleAsync(string userId, string roleName, CancellationToken cancellationToken = default);
}
