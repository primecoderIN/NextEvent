// using Domain;
// using MediatR;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// A query to retrieve a paginated list of events.
/// Inherits PaginationParams to automatically gain PageNumber and PageSize properties.
/// Returns a PagedList of Event objects instead of a standard List to support UI pagination.
/// </summary>
public class GetEventsListQuery : PaginationParams, IRequest<PagedList<Event>>
{
}
