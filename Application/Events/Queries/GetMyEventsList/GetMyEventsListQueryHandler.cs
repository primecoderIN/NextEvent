using Application.Core.Interfaces;
using Application.Core.Pagination;
using Application.Events.DTOs;
using Dapper;
using MediatR;
using Domain.Constants;

namespace Application.Events.Queries.GetMyEventsList;

public class GetMyEventsListQueryHandler(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserService currentUserService) : IRequestHandler<GetMyEventsListQuery, PagedList<EventResponseDto>>
{
    public async Task<PagedList<EventResponseDto>> Handle(GetMyEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var offset = (request.PageNumber - 1) * request.PageSize;
        var whereClauses = new List<string>();
        var parameters = new DynamicParameters();
        
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", request.PageSize);

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            whereClauses.Add("(e.Title LIKE @Q OR e.Description LIKE @Q)");
            parameters.Add("Q", $"%{request.Q}%");
        }
        if (request.CategoryId.HasValue)
        {
            whereClauses.Add("e.CategoryId = @CategoryId");
            parameters.Add("CategoryId", request.CategoryId.Value);
        }
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            whereClauses.Add("e.City LIKE @City");
            parameters.Add("City", $"%{request.City}%");
        }
        if (request.DateFrom.HasValue)
        {
            whereClauses.Add("e.Date >= @DateFrom");
            parameters.Add("DateFrom", request.DateFrom.Value);
        }
        if (request.DateTo.HasValue)
        {
            whereClauses.Add("e.Date <= @DateTo");
            parameters.Add("DateTo", request.DateTo.Value);
        }
        if (request.OrganizationId.HasValue)
        {
            whereClauses.Add("e.OrganizationId = @OrganizationId");
            parameters.Add("OrganizationId", request.OrganizationId.Value);
        }

        var userId = currentUserService.GetCurrentUserId();
        
        // Organizers can see all events in their orgs (including cancelled)
        // But for other orgs, only see active events.
        whereClauses.Add(@"(e.IsCancelled = 0 OR e.OrganizationId IN (
            SELECT o.Id FROM Organizations o WHERE o.OwnerUserId = @CurrentUserId
            UNION
            SELECT om.OrganizationId FROM OrganizationMembers om WHERE om.UserId = @CurrentUserId
        ))");
        parameters.Add("CurrentUserId", userId);

        var whereSql = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";

        var sql = $@"
            SELECT COUNT(e.Id) FROM Events e {whereSql};

            SELECT e.Id,
                   e.Title,
                   e.Description,
                   e.CategoryId,
                   c.Name AS Category,
                   e.Date,
                   e.City,
                   e.Venue,
                   e.IsCancelled,
                   e.Latitude,
                   e.Longitude,
                   o.Id AS OrganizationId,
                   o.Name AS OrganizationName,
                   o.Slug AS OrganizationSlug,
                   o.LogoUrl AS OrganizationLogoUrl
            FROM Events e
            LEFT JOIN Categories c ON e.CategoryId = c.Id
            LEFT JOIN Organizations o ON e.OrganizationId = o.Id
            {whereSql}
            ORDER BY e.Date DESC
            OFFSET @Offset ROWS 
            FETCH NEXT @PageSize ROWS ONLY;";
            
        using var multi = await connection.QueryMultipleAsync(sql, parameters);
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<EventResponseDto>()).ToList();
        
        return new PagedList<EventResponseDto>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
