using MediatR;
using Persistence;

namespace Application.Events.Commands;

public class EditEvent
{
    public class Command : IRequest // No return value
    {
        public required string Id { get; set; }
        public required UpdateEventDto EventData { get; set; }
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken)
                ?? throw new Exception("Event not found");

            var dto = request.EventData;

            eventEntity.ChangeTitle(dto.Title);
            eventEntity.ChangeDescription(dto.Description);
            eventEntity.ChangeCategory(dto.Category);
            eventEntity.ChangeDate(dto.Date);
            eventEntity.ChangeCity(dto.City);
            eventEntity.ChangeVenue(dto.Venue);
            eventEntity.ChangeIsCancelled(dto.IsCancelled);
            eventEntity.ChangeLatitude(dto.Latitude);
            eventEntity.ChangeLongitude(dto.Longitude);

            await context.SaveChangesAsync(cancellationToken);
        }
    }
}