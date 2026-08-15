using MediatR;
using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Events.Application.Events.Commands.UnsuspendEvent;

public class UnsuspendEventCommandHandler(EventsDbContext dbContext) : IRequestHandler<UnsuspendEventCommand>
{
    public async Task Handle(UnsuspendEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await dbContext.Events
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken);

        if (eventEntity == null)
            throw new NotFoundException(nameof(Domain.Event), request.Id);

        eventEntity.ChangeIsSuspended(false);

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
