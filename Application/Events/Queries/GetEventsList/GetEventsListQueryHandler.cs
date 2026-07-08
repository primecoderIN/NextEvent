using Application.Core.Interfaces;
using Application.Core.Pagination;
using Application.Events.DTOs;
using Dapper;
using MediatR;
// using Microsoft.EntityFrameworkCore;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// Handles the GetEventsListQuery.
/// Belongs to the Application layer, containing business logic and orchestrating data retrieval
/// via the ISqlConnectionFactory interface to avoid Persistence coupling and use Dapper for faster queries.
/// </summary>
public class GetEventsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventsListQuery, PagedList<EventResponseDto>>
{
    public async Task<PagedList<EventResponseDto>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var offset = (request.PageNumber - 1) * request.PageSize;
        
        // Initialize a list to hold all the dynamic WHERE conditions.
        // We only append to this list if the client provided a specific filter parameter.
        var whereClauses = new List<string>();
        
        // Initialize Dapper's DynamicParameters to securely map query arguments
        // and prevent SQL injection vulnerabilities.
        var parameters = new DynamicParameters();
        
        // Always include Offset and PageSize for the pagination FETCH logic
        parameters.Add("Offset", offset);
        parameters.Add("PageSize", request.PageSize);

        // General Search (Q): If the user provides a search string, 
        // filter events where the title or description contains the string.
        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            whereClauses.Add("(e.Title LIKE @Q OR e.Description LIKE @Q)");
            parameters.Add("Q", $"%{request.Q}%");
        }
        
        // Exact match on CategoryId if provided
        if (request.CategoryId.HasValue)
        {
            whereClauses.Add("e.CategoryId = @CategoryId");
            parameters.Add("CategoryId", request.CategoryId.Value);
        }
        
        // Partial text match on City name if provided
        if (!string.IsNullOrWhiteSpace(request.City))
        {
            whereClauses.Add("e.City LIKE @City");
            parameters.Add("City", $"%{request.City}%");
        }
        
        // DateRange logic: Only include events occurring ON or AFTER DateFrom
        if (request.DateFrom.HasValue)
        {
            whereClauses.Add("e.Date >= @DateFrom");
            parameters.Add("DateFrom", request.DateFrom.Value);
        }
        
        // DateRange logic: Only include events occurring ON or BEFORE DateTo
        if (request.DateTo.HasValue)
        {
            whereClauses.Add("e.Date <= @DateTo");
            parameters.Add("DateTo", request.DateTo.Value);
        }

        // Dynamically build the final WHERE string. 
        // If there are no clauses, it stays empty (meaning return all events).
        // Otherwise, it concatenates them with 'AND' so all conditions must be met.
        var whereSql = whereClauses.Count > 0 ? "WHERE " + string.Join(" AND ", whereClauses) : "";

        // Execute two queries in a single database roundtrip using Dapper's QueryMultiple
        // 1. Gets the absolute total count of events in the database (for TotalPages calculation)
        // 2. Gets only the specific subset of events for the current page (using OFFSET/FETCH)
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
                   e.Longitude
            FROM Events e
            LEFT JOIN Categories c ON e.CategoryId = c.Id
            {whereSql}
            ORDER BY e.Date DESC
            OFFSET @Offset ROWS 
            FETCH NEXT @PageSize ROWS ONLY;";
            
        using var multi = await connection.QueryMultipleAsync(sql, parameters);
        
        // The results must be read in the exact order they were executed in the SQL string
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<EventResponseDto>()).ToList();
        
        return new PagedList<EventResponseDto>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
