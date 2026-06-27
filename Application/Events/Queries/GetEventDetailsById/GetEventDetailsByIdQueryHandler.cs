using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQueryHandler(IAppDBContext context) : IRequestHandler<GetEventDetailsByIdQuery, Event>
{
    public async Task<Event> Handle(GetEventDetailsByIdQuery request, CancellationToken cancellationToken)
    {
        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken);
        
        if (eventEntity == null) 
        {
            throw new NotFoundException(nameof(Event), request.Id);
        }

        return eventEntity;
    }
}
