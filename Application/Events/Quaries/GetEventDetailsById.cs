using Application.Core.Exceptions;
using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Quaries;

public class GetEventDetailsById
{
    public class Query : IRequest<Event>
    {
        public required string Id { get; set; }
    }

    public class Handler(AppDBContext context) : IRequestHandler<Query, Event>
    {
        public async Task<Event> Handle(Query request, CancellationToken cancellationToken)
        {
            var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken);

            // Throw instead of returning null — keeps the controller free of null checks
            // and ensures the 404 response is always formatted as ApiResponse<T>.
            if (eventEntity is null)
                throw new NotFoundException(nameof(Event), request.Id);

            return eventEntity;
        }
    }
}