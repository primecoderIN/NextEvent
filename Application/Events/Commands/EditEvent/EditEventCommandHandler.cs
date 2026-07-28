using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using MediatR;

using Domain.Constants;

namespace Application.Events.Commands.EditEvent;

public class EditEventCommandHandler(
    IAppDBContext context,
    IEventAuthorizationService eventAuthorizationService) : IRequestHandler<EditEventCommand, Unit>
{
    public async Task<Unit> Handle(EditEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await eventAuthorizationService.AuthorizeAndGetAsync(request.Id, PermissionConstants.EventsUpdate, cancellationToken);

        var dto = request.EventData;

        eventEntity.ChangeTitle(dto.Title);
        eventEntity.ChangeDescription(dto.Description);
        eventEntity.ChangeCategoryId(dto.CategoryId);
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
