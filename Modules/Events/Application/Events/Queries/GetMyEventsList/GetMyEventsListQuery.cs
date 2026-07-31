using NextEvent.Shared.Pagination;
using NextEvent.Modules.Events.Application.Events.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetMyEventsList;
public class GetMyEventsListQuery : PaginationParams, IRequest<PagedList<EventResponseDto>>
{
    public string? Q { get; init; }
    public Guid? CategoryId { get; init; }
    public string? City { get; init; }
    public DateTime? DateFrom { get; init; }
    public DateTime? DateTo { get; init; }
    public Guid? OrganizationId { get; init; }
}
