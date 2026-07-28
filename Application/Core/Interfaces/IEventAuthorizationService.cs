namespace Application.Core.Interfaces;

/// <summary>
/// Resolves event ownership and authorizes the current user in one call.
/// Composes IOrganizationAuthorizationService — does not re-implement permission logic.
///
/// Use this in any handler that receives an event ID and needs to verify
/// the caller has a specific permission on the organization that owns that event.
/// Returns the loaded event entity so handlers avoid a second DB round-trip.
/// </summary>
public interface IEventAuthorizationService
{
    /// <summary>
    /// Loads the event by ID, then checks the current user has <paramref name="permissionCode"/>
    /// on the organization that owns the event (OrganizationId sourced from DB — cannot be spoofed).
    /// </summary>
    /// <returns>The loaded event entity.</returns>
    /// <exception cref="Application.Core.Exceptions.NotFoundException">Event with given ID does not exist.</exception>
    /// <exception cref="Application.Core.Exceptions.ForbiddenAccessException">User lacks the required permission.</exception>
    Task<Domain.Event> AuthorizeAndGetAsync(
        Guid eventId,
        string permissionCode,
        CancellationToken cancellationToken = default);
}
