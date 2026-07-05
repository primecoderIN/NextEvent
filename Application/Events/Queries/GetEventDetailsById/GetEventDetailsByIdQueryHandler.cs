using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Application.Events.DTOs;
using Dapper;
using Domain;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetEventDetailsByIdQuery, EventResponseDto>
{
    public async Task<EventResponseDto> Handle(GetEventDetailsByIdQuery request, CancellationToken cancellationToken)
    {
        // CQRS (Queries): Create a raw connection instead of using EF Core
        using var connection = connectionFactory.CreateConnection();
        
        // Parameterized SQL query to prevent SQL injection
        var sql = @"
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
            WHERE e.Id = @Id";
        
        // Dapper securely executes the query and maps the first result to the EventResponseDto class
        var eventDto = await connection.QueryFirstOrDefaultAsync<EventResponseDto>(sql, new { Id = request.Id });
        
        if (eventDto == null) 
        {
            throw new NotFoundException(nameof(Event), request.Id);
        }
        
        // Note: the ExceptionMiddleware will catch nulls and return 404
        return eventDto;
    }
}
