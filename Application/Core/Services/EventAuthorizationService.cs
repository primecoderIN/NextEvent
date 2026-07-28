using Application.Core.Exceptions;
using Application.Core.Interfaces;

namespace Application.Core.Services;

/// <summary>
/// Thin ownership-resolver: loads an event and delegates the actual
/// permission check to IOrganizationAuthorizationService.
/// No permission logic lives here — it all stays in OrganizationAuthorizationService.
/// </summary>
public class EventAuthorizationService(
    IAppDBContext context,
    IOrganizationAuthorizationService organizationAuthorizationService)
    : IEventAuthorizationService
{
    public async Task<Domain.Event> AuthorizeAndGetAsync(
        Guid eventId,
        string permissionCode,
        CancellationToken cancellationToken = default)
    {
        // 1. Load the event — OrganizationId comes from DB, not the caller
        var eventEntity = await context.Events.FindAsync([eventId], cancellationToken)
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

        // 3. Return the already-loaded entity — callers don't need a second DB hit
        return eventEntity;
    }
}
