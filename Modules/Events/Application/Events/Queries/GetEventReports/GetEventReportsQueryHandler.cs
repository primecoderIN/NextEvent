using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Events.Application.Events.DTOs;
using NextEvent.Modules.Events.Persistence.Contexts;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetEventReports;

public class GetEventReportsQueryHandler(EventsDbContext dbContext) : IRequestHandler<GetEventReportsQuery, List<EventReportDto>>
{
    public async Task<List<EventReportDto>> Handle(GetEventReportsQuery request, CancellationToken cancellationToken)
    {
        var reports = await dbContext.EventReports
            .Where(r => r.EventId == request.EventId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new EventReportDto
            {
                Id = r.Id,
                EventId = r.EventId,
                ReportedById = r.ReportedById,
                Reason = r.Reason,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return reports;
    }
}
