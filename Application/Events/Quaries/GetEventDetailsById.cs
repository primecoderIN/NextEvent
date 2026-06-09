using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Quaries;

public class GetEventDetailsById
{
    public class Query : IRequest<Event>
    {
        public required string Id {get;set;}
    }
    
    public class Handler(AppDBContext context) : IRequestHandler<Query, Event>
    {
        public async Task<Event> Handle(Query request, CancellationToken cancellationToken)
        {
            var _event = await context.Events.FindAsync([request.Id], cancellationToken) ?? throw new Exception("Not found");
            return _event;
        }
    }

}