using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Events.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Events.Services;

/// <summary>
/// Thin ownership-resolver: loads an event and delegates the actual
/// permission check to IOrganizationAuthorizationService.
/// No permission logic lives here — it all stays in OrganizationAuthorizationService.
/// </summary>
public class EventAuthorizationService(
    EventsDbContext context,
    IOrganizationAuthorizationService organizationAuthorizationService)
    : IEventAuthorizationService
{
    /// <summary>
    /// Loads an event by ID and authorizes the current user against the event's true OrganizationId.
    /// Prevents Broken Object Level Authorization (BOLA) by refusing to trust client-provided Organization IDs.
    /// Returns the OrganizationId so handlers can use it for further logic.
    /// </summary>
    public async Task<Guid> AuthorizeAndGetOrganizationIdAsync(
        Guid eventId,
        string permissionCode,
        CancellationToken cancellationToken = default)
    {
        // 1. Load the event's organization ID from DB.
        // SECURITY (BOLA): We MUST fetch the entity from the database first to discover its true OrganizationId.
        // If we relied on an OrganizationId passed in the request body/URL, a malicious user could spoof it
        // and bypass authorization for an event they don't own.
        var eventEntity = await context.Events
            .Where(e => e.Id == eventId)
            .Select(e => new { e.Id, e.OrganizationId })
            .FirstOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(nameof(Domain.Event), eventId);

        // 2. Delegate org-level permission check to the existing service
        // If OrganizationId is null, it means the event doesn't belong to an org,
        // so org-level authorization is not possible (or we deny by default).
        if (!eventEntity.OrganizationId.HasValue)
            throw new ForbiddenAccessException("This event does not belong to any organization.");

        await organizationAuthorizationService.AuthorizeAsync(
            eventEntity.OrganizationId.Value,
            permissionCode,
            cancellationToken);

        // 3. Return the OrganizationId
        return eventEntity.OrganizationId.Value;
    }
}
