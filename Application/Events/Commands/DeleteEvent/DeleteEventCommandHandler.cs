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
        var eventEntity = await eventAuthorizationService.AuthorizeAndGetAsync(request.Id, PermissionConstants.EventsCancel, cancellationToken);
        
        context.Events.Remove(eventEntity);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
