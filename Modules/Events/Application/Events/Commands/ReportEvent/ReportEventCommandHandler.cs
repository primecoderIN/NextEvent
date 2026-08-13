using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Events.Domain;
using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Events.Application.Events.Commands.ReportEvent;

public class ReportEventCommandHandler(
    EventsDbContext dbContext,
    ICurrentUserService currentUserService) : IRequestHandler<ReportEventCommand>
{
    public async Task Handle(ReportEventCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId();
        if (currentUserId == null)
            throw new UnauthorizedException("User is not authenticated");

        var organizationId = currentUserService.GetCurrentUserOrganizationId();
        if (organizationId != null)
            throw new ForbiddenAccessException("Users part of an organization are not allowed to report events.");

        var eventExists = await dbContext.Events
            .AnyAsync(e => e.Id == request.Id, cancellationToken);

        if (!eventExists)
            throw new NotFoundException(nameof(Event), request.Id);

        var report = new EventReport
        {
            EventId = request.Id,
            ReportedById = currentUserId,
            Reason = request.Reason
        };

        dbContext.EventReports.Add(report);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
