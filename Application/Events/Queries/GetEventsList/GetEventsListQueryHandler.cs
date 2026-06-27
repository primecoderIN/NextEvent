using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Events.Queries.GetEventsList;

public class GetEventsListQueryHandler(IAppDBContext context) : IRequestHandler<GetEventsListQuery, List<Event>>
{
    public async Task<List<Event>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        return await context.Events.ToListAsync(cancellationToken);
    }
}
