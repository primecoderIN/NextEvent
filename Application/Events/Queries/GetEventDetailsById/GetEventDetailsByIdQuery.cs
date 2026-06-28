using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQuery : IRequest<EventResponseDto>
{
    public required Guid Id { get; set; }
}
