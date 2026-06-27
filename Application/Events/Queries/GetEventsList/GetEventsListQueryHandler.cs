// using Application.Core.Interfaces;
// using Domain;
// using MediatR;
// using Microsoft.EntityFrameworkCore;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// Handles the GetEventsListQuery.
/// Belongs to the Application layer, containing business logic and orchestrating data retrieval
/// via the IAppDBContext interface to avoid Persistence coupling.
/// </summary>
public class GetEventsListQueryHandler(IAppDBContext context) : IRequestHandler<GetEventsListQuery, List<Event>>
{
    public async Task<List<Event>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        return await context.Events.ToListAsync(cancellationToken);
    }
}
