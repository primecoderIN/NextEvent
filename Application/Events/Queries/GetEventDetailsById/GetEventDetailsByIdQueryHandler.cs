using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Application.Events.DTOs;
using Dapper;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventDetailsByIdQuery, EventDto>
{
    public async Task<EventDto> Handle(GetEventDetailsByIdQuery request, CancellationToken cancellationToken)
    {
        // CQRS (Queries): Create a raw connection instead of using EF Core
        using var connection = connectionFactory.CreateConnection();
        
        // Parameterized SQL query to prevent SQL injection
        var sql = "SELECT * FROM Events WHERE Id = @Id";
        
        // Dapper securely executes the query and maps the first result to the EventDto class
        var eventDto = await connection.QueryFirstOrDefaultAsync<EventDto>(sql, new { Id = request.Id });
        
        if (eventDto == null) 
        {
            throw new NotFoundException(nameof(Event), request.Id);
        }

        return eventEntity;
    }
}
