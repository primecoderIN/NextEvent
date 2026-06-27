using MediatR;
using Application.Core.Interfaces;

namespace Application.Events.Commands.CreateEvent;

// Injecting the interface IAppDBContext instead of AppDBContext 
// adheres to Clean Architecture Dependency Inversion.
public class CreateEventCommandHandler(IAppDBContext context) : IRequestHandler<CreateEventCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateEventCommand request,
        CancellationToken cancellationToken)
    {
        var eventEntity = new Domain.Event
        {
            Id = Guid.NewGuid(),
            Title = request.Event.Title,
            Description = request.Event.Description,
            Category = request.Event.Category,
            Date = request.Event.Date,
            City = request.Event.City,
            Venue = request.Event.Venue,
            Latitude = request.Event.Latitude,
            Longitude = request.Event.Longitude
        };

        context.Events.Add(eventEntity);
        await context.SaveChangesAsync(cancellationToken);

        return eventEntity.Id;
    }
}
