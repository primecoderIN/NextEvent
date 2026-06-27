using MediatR;
using Persistence;

namespace Application.Events.Commands.CreateEvent;

public class CreateEventCommandHandler(AppDBContext context) : IRequestHandler<CreateEventCommand, string>
{
    public async Task<string> Handle(
        CreateEventCommand request,
        CancellationToken cancellationToken)
    {
        var eventEntity = new Domain.Event
        {
            Id = Guid.NewGuid().ToString(),
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
