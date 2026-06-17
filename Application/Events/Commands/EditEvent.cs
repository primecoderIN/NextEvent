using Application.Core.Exceptions;
using Application.Events.DTOs;
using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Commands;

public class EditEvent
{
    /// <summary>
    /// Returns <see cref="Unit"/> (void equivalent) on success.
    /// Throws <see cref="NotFoundException"/> when the event does not exist,
    /// allowing the middleware to produce a 404 ApiResponse automatically.
    /// </summary>
    public class Command : IRequest<Unit>
    {
        public required string Id { get; set; }
        public required UpdateEventDto EventData { get; set; }
    }

    public class Handler(AppDBContext context) : IRequestHandler<Command, Unit>
    {
        public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
        {
            var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken) ?? throw new NotFoundException(nameof(Event), request.Id);

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

            return Unit.Value;
        }
    }
}
