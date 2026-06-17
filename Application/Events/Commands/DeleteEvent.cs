using Application.Core.Exceptions;
using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Commands;

public class DeleteEvent
{
    /// <summary>
    /// Returns <see cref="Unit"/> (void equivalent) on success.
    /// Throws <see cref="NotFoundException"/> when the event does not exist,
    /// allowing the middleware to produce a 404 ApiResponse automatically.
    /// </summary>
    public class Command : IRequest<Unit>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command, Unit>
    {
        public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
        {
            var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken) ?? throw new NotFoundException(nameof(Event), request.Id);

            context.Remove(eventEntity);

            await context.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}