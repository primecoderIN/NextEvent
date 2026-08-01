using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Events.Persistence.Contexts;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.DeleteEvent;

public class DeleteEventCommandHandler(
    EventsDbContext context,
    IOrganizationAuthorizationService organizationAuthorizationService) : IRequestHandler<DeleteEventCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken)
            ?? throw new NotFoundException(nameof(Event), request.Id);

        if (!eventEntity.OrganizationId.HasValue)
            throw new ForbiddenAccessException("This event does not belong to any organization.");

        // SECURITY (BOLA): Authorize using the event's TRUE organization, preventing spoofing.
        await organizationAuthorizationService.AuthorizeAsync(
            eventEntity.OrganizationId.Value, 
            PermissionConstants.EventsCancel, 
            cancellationToken);

        context.Events.Remove(eventEntity);
        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
