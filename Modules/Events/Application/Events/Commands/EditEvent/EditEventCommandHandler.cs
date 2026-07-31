using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Events.Persistence.Contexts;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.EditEvent;

public class EditEventCommandHandler(
    EventsDbContext context,
    IEventAuthorizationService eventAuthorizationService) : IRequestHandler<EditEventCommand, Unit>
{
    public async Task<Unit> Handle(EditEventCommand request, CancellationToken cancellationToken)
    {
        // SECURITY (BOLA): AuthorizeAndGetOrganizationIdAsync loads the event from DB,
        // verifies the user has the required permission against the event's TRUE organization, preventing spoofing.
        await eventAuthorizationService.AuthorizeAndGetOrganizationIdAsync(
            request.Id, PermissionConstants.EventsUpdate, cancellationToken);

        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken)
            ?? throw new NotFoundException(nameof(Event), request.Id);

        var dto = request.EventData;

        eventEntity.ChangeTitle(dto.Title);
        eventEntity.ChangeDescription(dto.Description);
        eventEntity.ChangeCategoryId(dto.CategoryId);
        eventEntity.ChangeDate(dto.Date);
        eventEntity.ChangeTimeZoneId(dto.TimeZoneId);
        eventEntity.ChangeCity(dto.City);
        eventEntity.ChangeVenue(dto.Venue);
        eventEntity.ChangeIsCancelled(dto.IsCancelled);
        eventEntity.ChangeLatitude(dto.Latitude);
        eventEntity.ChangeLongitude(dto.Longitude);

        await context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
