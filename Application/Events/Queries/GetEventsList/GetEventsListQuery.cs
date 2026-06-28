using Application.Core.Pagination;
using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// A query that requests a paginated list of events.
/// Inherits from PaginationParams to automatically get PageNumber and PageSize properties,
/// allowing API endpoints to bind [FromQuery] parameters effortlessly.
/// </summary>
public class GetEventsListQuery : PaginationParams, IRequest<PagedList<EventDto>>
{
}
