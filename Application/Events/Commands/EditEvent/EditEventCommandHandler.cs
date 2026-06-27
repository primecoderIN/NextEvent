using Application.Core.Exceptions;
using Domain;
using MediatR;
using Persistence;

namespace Application.Events.Commands.EditEvent;

public class EditEventCommandHandler(AppDBContext context) : IRequestHandler<EditEventCommand, Unit>
{
    public async Task<Unit> Handle(EditEventCommand request, CancellationToken cancellationToken)
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
