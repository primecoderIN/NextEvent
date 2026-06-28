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
public class GetEventsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventsListQuery, List<Event>>
{
    public async Task<List<Event>> Handle(GetEventsListQuery request, CancellationToken cancellationToken)
    {
        // CQRS (Queries): Create a raw IDbConnection. This does not use EF Core's DbContext, 
        // bypassing change tracking for faster reads.
        using var connection = connectionFactory.CreateConnection();
        
        // Write raw, highly optimized SQL.
        var sql = "SELECT * FROM Events";
        
        // Dapper automatically maps the SQL result set directly to our domain objects (or DTOs).
        var events = await connection.QueryAsync<Event>(sql);
        
        return events.ToList();
    }
}
