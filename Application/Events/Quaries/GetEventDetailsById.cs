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
            // Throw instead of returning null — keeps the controller free of null checks
            // and ensures the 404 response is always formatted as ApiResponse<T>.
            var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken) ?? throw new NotFoundException(nameof(Event), request.Id);

            return eventEntity;
        }
    }
}