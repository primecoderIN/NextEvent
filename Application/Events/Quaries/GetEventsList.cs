using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Events.Quaries;

public class GetEventsList
{
    // Query represents a request to retrieve all events. 
    // IRequest<List<Event>> tells MediatR that this request 
    // expects a List<Event> as the response.
    public class Query : IRequest<List<Event>>{} //Represents the request

     // Handler processes the Query request.
     // It contains the logic required to fulfill the request.
    public class Handler(AppDBContext context) : IRequestHandler<Query, List<Event>> //We must implement required method for this interface
    {
          // Handle is automatically called by MediatR when  a Query is sent through mediator.Send().

        public async Task<List<Event>> Handle(Query request, CancellationToken cancellationToken)
        {
            // Fetch all events from the database. 
            // The cancellation token allows the operation 
            // to be cancelled if the request is aborted.
            return await context.Events.ToListAsync(cancellationToken);
        }
    }
}

// Query represents the request.
// Handler processes the request and returns the result.