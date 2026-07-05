using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using MediatR;

namespace Application.Events.Commands.DeleteEvent;

public class DeleteEventCommandHandler(IAppDBContext context) : IRequestHandler<DeleteEventCommand, Unit>
{
    public async Task<Unit> Handle(DeleteEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken) ?? throw new NotFoundException(nameof(Event), request.Id);
        
        context.Events.Remove(eventEntity);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
