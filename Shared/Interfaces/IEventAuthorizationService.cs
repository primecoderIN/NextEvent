namespace NextEvent.Shared.Interfaces;

/// <summary>
/// Resolves event ownership and authorizes the current user in one call.
/// Composes IOrganizationAuthorizationService — does not re-implement permission logic.
///
/// Use this in any handler that receives an event ID and needs to verify
/// the caller has a specific permission on the organization that owns that event.
/// Returns the owner OrganizationId so handlers can do further authorization.
/// </summary>
public interface IEventAuthorizationService
{
    /// <summary>
    /// Checks the current user has <paramref name="permissionCode"/>
    /// on the organization that owns the event (OrganizationId sourced from DB — cannot be spoofed).
    /// Returns the OrganizationId of the event's owner.
    /// </summary>
    /// <exception cref="NextEvent.Shared.Exceptions.NotFoundException">Event with given ID does not exist.</exception>
    /// <exception cref="NextEvent.Shared.Exceptions.ForbiddenAccessException">User lacks the required permission.</exception>
    Task<Guid> AuthorizeAndGetOrganizationIdAsync(
        Guid eventId,
        string permissionCode,
        CancellationToken cancellationToken = default);
}
