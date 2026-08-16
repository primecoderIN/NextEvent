using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Events.Domain;
using NextEvent.Modules.Events.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Events.Application.Events.Commands.ReportEvent;

public class ReportEventCommandHandler(
    EventsDbContext dbContext,
    ICurrentUserService currentUserService,
    IOrganizationMemberService memberService,
    IDateTimeProvider dateTimeProvider) : IRequestHandler<ReportEventCommand>
{
    public async Task Handle(ReportEventCommand request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId();
        if (currentUserId == null)
            throw new UnauthorizedException("User is not authenticated");

        // Organizations or users who belong to an organization cannot report events (e.g. competitors)
        var isOrganizationMember = await memberService.IsActiveMemberOfAnyOrganizationAsync(currentUserId, cancellationToken);
        if (isOrganizationMember)
            throw new ForbiddenAccessException("Users part of an organization are not allowed to report events.");

        var eventExists = await dbContext.Events
            .AnyAsync(e => e.Id == request.Id && !e.IsCancelled && !e.IsSuspended, cancellationToken);

        if (!eventExists)
            throw new NotFoundException(nameof(Event), request.Id);

        // Check if the user has already reported this event to prevent duplicate reports
        var alreadyReported = await dbContext.EventReports
            .AnyAsync(r => r.EventId == request.Id && r.ReportedById == currentUserId, cancellationToken);

        if (alreadyReported)
            throw new BusinessRuleException("You have already reported this event.");

        var report = new EventReport
        {
            EventId = request.Id,
            ReportedById = currentUserId,
            Reason = request.Reason.Trim(),
            CreatedAt = dateTimeProvider.UtcNow
        };

        dbContext.EventReports.Add(report);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
