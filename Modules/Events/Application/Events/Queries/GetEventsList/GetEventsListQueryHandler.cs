using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Events.Application.Events.DTOs;
using Dapper;
using MediatR;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetEventsList;

/// <summary>
/// Handles the GetEventsListQuery for public events.
/// Only returns non-cancelled events.
/// </summary>
public class GetEventsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventsListQuery, PagedList<EventResponseDto>>
{
    public async Task<PagedList<EventResponseDto>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var (sql, parameters) = new EventQueryBuilder(request.PageNumber, request.PageSize)
            .WithSearch(request.Q)
            .WithCategory(request.CategoryId)
            .WithCity(request.City)
            .WithDateRange(request.DateFrom, request.DateTo)
            .WithOrganization(request.OrganizationId)
            .WithActiveOnly()
            .Build(orderDescending: false);
            
        using var multi = await connection.QueryMultipleAsync(sql, parameters);
        
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<EventResponseDto>()).ToList();
        
        return new PagedList<EventResponseDto>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
