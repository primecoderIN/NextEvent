using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Events.Application.Events.DTOs;
using Dapper;
using MediatR;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetMyEventsList;

public class GetMyEventsListQueryHandler(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserService currentUserService) : IRequestHandler<GetMyEventsListQuery, PagedList<EventResponseDto>>
{
    public async Task<PagedList<EventResponseDto>> Handle(GetMyEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var currentOrgId = currentUserService.GetCurrentOrganizationId();
        
        var builder = new EventQueryBuilder(request.PageNumber, request.PageSize)
            .WithSearch(request.Q)
            .WithCategory(request.CategoryId)
            .WithCity(request.City)
            .WithDateRange(request.DateFrom, request.DateTo)
            .WithOrganization(request.OrganizationId);

        // Organizers can only see events for their active organization.
        if (currentOrgId.HasValue)
        {
            builder.WithCustomCondition("e.OrganizationId = @CurrentOrgId", "CurrentOrgId", currentOrgId.Value);
        }
        else
        {
            builder.WithFalseCondition();
        }

        var (sql, parameters) = builder.Build(orderDescending: true);
            
        using var multi = await connection.QueryMultipleAsync(sql, parameters);
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<EventResponseDto>()).ToList();
        
        return new PagedList<EventResponseDto>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
