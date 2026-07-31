
namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Centralized service for querying Organization Membership data.
/// Extracts data-access logic (LINQ queries) out of command handlers.
/// </summary>
public interface IOrganizationMemberService
{
    /// <summary>
    /// Checks if a user is an active member of ANY organization across the entire platform.
    /// This enforces the business rule that a user can only belong to a single organization.
    /// </summary>
    Task<bool> IsActiveMemberOfAnyOrganizationAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a user's membership record for a specific organization, if it exists.
    /// Useful for checking invitation status or active membership in a specific context.
    /// </summary>
    /// Returns a tuple: (IsFound, Status, MembershipId) — avoids a hard domain reference from Shared.
    Task<(bool Found, string? Status, Guid? MembershipId)> GetMembershipAsync(Guid organizationId, string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves the ID of the organization the user currently belongs to, either as the Owner or an Active Member.
    /// Used during token generation to embed the organization ID into the JWT.
    /// </summary>
    Task<Guid?> GetActiveOrganizationIdAsync(string userId, CancellationToken cancellationToken = default);
}
