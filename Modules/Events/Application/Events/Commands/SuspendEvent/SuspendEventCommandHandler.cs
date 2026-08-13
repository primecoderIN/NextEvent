using MediatR;
using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Events.Commands.SuspendEvent;

public class SuspendEventCommandHandler(EventsDbContext dbContext) : IRequestHandler<SuspendEventCommand>
{
    public async Task Handle(SuspendEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (eventEntity == null)
            throw new NotFoundException(nameof(Domain.Event), request.Id);

        eventEntity.ChangeIsSuspended(true);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
