using NextEvent.Modules.Events.Application.Events.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Queries.GetEventDetailsById;
public class GetEventDetailsByIdQuery : IRequest<EventResponseDto>
{
    public required Guid Id { get; set; }
}
