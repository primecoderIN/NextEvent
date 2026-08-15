using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Events.Application.Events.DTOs;
using Dapper;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetAdminEventsList;

public class GetAdminEventsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetAdminEventsListQuery, PagedList<EventResponseDto>>
{
    public async Task<PagedList<EventResponseDto>> Handle(GetAdminEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var (sql, parameters) = new EventQueryBuilder(request.PageNumber, request.PageSize)
            .WithSearch(request.Q)
            .WithCategory(request.CategoryId)
            .WithCity(request.City)
            .WithDateRange(request.DateFrom, request.DateTo)
            .WithOrganization(request.OrganizationId)
            .WithStatus(request.Status)
            // Admin sees all events, so no WithActiveOnly() is called.
            .Build(orderDescending: true);
            
        using var multi = await connection.QueryMultipleAsync(sql, parameters);
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<EventResponseDto>()).ToList();
        
        return new PagedList<EventResponseDto>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
