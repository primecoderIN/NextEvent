using MediatR;
using NextEvent.Modules.Events.Application.Events.DTOs;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetEventReports;

public class GetEventReportsQuery : IRequest<List<EventReportDto>>
{
    public Guid EventId { get; set; }
}
