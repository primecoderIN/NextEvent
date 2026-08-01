using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Events.Persistence.Contexts;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.EditEvent;

public class EditEventCommandHandler(
    EventsDbContext context,
    IOrganizationAuthorizationService organizationAuthorizationService) : IRequestHandler<EditEventCommand, Unit>
{
    public async Task<Unit> Handle(EditEventCommand request, CancellationToken cancellationToken)
    {
        var eventEntity = await context.Events.FindAsync([request.Id], cancellationToken)
            ?? throw new NotFoundException(nameof(Event), request.Id);

        if (!eventEntity.OrganizationId.HasValue)
            throw new ForbiddenAccessException("This event does not belong to any organization.");

        // SECURITY (BOLA): Authorize using the event's TRUE organization, preventing spoofing.
        await organizationAuthorizationService.AuthorizeAsync(
            eventEntity.OrganizationId.Value, 
            PermissionConstants.EventsUpdate, 
            cancellationToken);

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
