using MediatR;
using Persistence;
using Application.Events.DTOs;


namespace Application.Events.Commands;

public class CreateEvent
{
    public class Command : IRequest<string>
    {
        public required CreateEventDto Event { get; set; }
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command, string>
    {
        public async Task<string> Handle(
            Command request,
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
}