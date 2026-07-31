using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Events.Persistence.Contexts;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.DeleteEvent;

public class DeleteEventCommandHandler(
    EventsDbContext context,
    IEventAuthorizationService eventAuthorizationService) : IRequestHandler<DeleteEventCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        // SECURITY (BOLA): AuthorizeAndGetOrganizationIdAsync loads the event, verifies the user 
        // has the required permission against the event's TRUE organization, preventing spoofing.
        await eventAuthorizationService.AuthorizeAndGetOrganizationIdAsync(
            request.Id, PermissionConstants.EventsCancel, cancellationToken);

        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken)
            ?? throw new NotFoundException(nameof(Event), request.Id);

        context.Events.Remove(eventEntity);
        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
