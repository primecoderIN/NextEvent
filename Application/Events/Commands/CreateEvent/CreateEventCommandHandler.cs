using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Events.Commands.CreateEvent;

// Injecting the interface IAppDBContext instead of AppDBContext 
// adheres to Clean Architecture Dependency Inversion.
// Injecting ICurrentUserService instead of HttpContext decouples this handler from
// HTTP concerns and makes it testable without a request context.
public class CreateEventCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService) : IRequestHandler<CreateEventCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateEventCommand request,
        CancellationToken cancellationToken)
    {
        // ── 1. Authenticate ────────────────────────────────────────────────────
        var currentUserId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        // ── 2. Verify the organization exists and is active ────────────────────
        var orgExists = await context.Organizations
            .AnyAsync(o => o.Id == request.Event.OrganizationId
                        && o.Status == "active"
                        && !o.IsDeleted, cancellationToken);

        if (!orgExists)
            throw new NotFoundException("Organization", request.Event.OrganizationId);

        // ── 3. RBAC: caller must be an active member with events.create ────────
        // SECURITY (BOLA): We authorize against the OrganizationId provided in the request payload.
        // Even if they spoof the ID to belong to another organization, this check will fail unless
        // they are ACTUALLY an active member with events.create permission in that target organization.
        await authorizationService.AuthorizeAsync(
            request.Event.OrganizationId, 
            PermissionConstants.EventsCreate, 
            cancellationToken);

        // ── 4. Create the event ────────────────────────────────────────────────
        var eventEntity = new Domain.Event
        {
            Id             = Guid.NewGuid(),
            OrganizationId = request.Event.OrganizationId,
            Title          = request.Event.Title,
            Description    = request.Event.Description,
            CategoryId     = request.Event.CategoryId,
            Date           = request.Event.Date,
            City           = request.Event.City,
            Venue          = request.Event.Venue,
            Latitude       = request.Event.Latitude,
            Longitude      = request.Event.Longitude
        };

        context.Events.Add(eventEntity);
        await context.SaveChangesAsync(cancellationToken);

        return eventEntity.Id;
    }
}
