using Application.Core.Pagination;
using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// A query that requests a paginated list of events.
/// Inherits from PaginationParams to automatically get PageNumber and PageSize properties,
/// allowing API endpoints to bind [FromQuery] parameters effortlessly.
/// </summary>
public class GetEventsListQuery : PaginationParams, IRequest<PagedList<EventResponseDto>>
{
    public string? Q { get; init; }
    public Guid? CategoryId { get; init; }
    public string? City { get; init; }
    public DateTimeOffset? DateFrom { get; init; }
    public DateTimeOffset? DateTo { get; init; }
    public Guid? OrganizationId { get; init; }
}
