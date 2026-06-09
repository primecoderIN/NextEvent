using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Quaries;

public class GetEventDetailsById
{
    public class Query : IRequest<Event?>
    {
        public required string Id {get;set;}
    }
    
    public class Handler(AppDBContext context) : IRequestHandler<Query, Event?>
    {
        public async Task<Event?> Handle(Query request, CancellationToken cancellationToken)
        {
            return await context.Events.FindAsync([request.Id], cancellationToken);
    
        }
    }

}