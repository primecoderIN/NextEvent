// using Application.Core.Interfaces;
// using Domain;
// using MediatR;
// using Microsoft.EntityFrameworkCore;

namespace Application.Events.Queries.GetEventsList;

/// <summary>
/// Handles the GetEventsListQuery.
/// Belongs to the Application layer, containing business logic and orchestrating data retrieval
/// via the ISqlConnectionFactory interface to avoid Persistence coupling and use Dapper for faster queries.
/// </summary>
public class GetEventsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventsListQuery, PagedList<Event>>
{
    public async Task<PagedList<Event>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();
        
        var offset = (request.PageNumber - 1) * request.PageSize;
        
        // Execute two queries in a single database roundtrip using Dapper's QueryMultiple
        // 1. Gets the absolute total count of events in the database (for TotalPages calculation)
        // 2. Gets only the specific subset of events for the current page (using OFFSET/FETCH)
        var sql = @"
            SELECT COUNT(Id) FROM Events;
            
            SELECT * FROM Events 
            ORDER BY Date DESC
            OFFSET @Offset ROWS 
            FETCH NEXT @PageSize ROWS ONLY;";
            
        using var multi = await connection.QueryMultipleAsync(sql, new { Offset = offset, PageSize = request.PageSize });
        
        // The results must be read in the exact order they were executed in the SQL string
        var totalCount = await multi.ReadFirstAsync<int>();
        var events = (await multi.ReadAsync<Event>()).ToList();
        
        return new PagedList<Event>(events, totalCount, request.PageNumber, request.PageSize);
    }
}
