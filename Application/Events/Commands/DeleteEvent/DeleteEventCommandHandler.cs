using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using MediatR;

using Domain.Constants;

namespace Application.Events.Commands.DeleteEvent;

public class DeleteEventCommandHandler(
    IAppDBContext context,
    IEventAuthorizationService eventAuthorizationService) : IRequestHandler<DeleteEventCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        // SECURITY (BOLA): The eventAuthorizationService securely loads the event and verifies the user 
        // has the required permission against the event's TRUE organization, preventing spoofing.
        var eventEntity = await eventAuthorizationService.AuthorizeAndGetAsync(request.Id, PermissionConstants.EventsCancel, cancellationToken);
        
        context.Events.Remove(eventEntity);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
