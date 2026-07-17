using Application.Core.Pagination;
using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Queries.GetAdminEventsList;

public class GetAdminEventsListQuery : PaginationParams, IRequest<PagedList<EventResponseDto>>
{
    public string? Q { get; init; }
    public Guid? CategoryId { get; init; }
    public string? City { get; init; }
    public DateTimeOffset? DateFrom { get; init; }
    public DateTimeOffset? DateTo { get; init; }
    public Guid? OrganizationId { get; init; }
}
