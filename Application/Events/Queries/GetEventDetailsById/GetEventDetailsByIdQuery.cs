// using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Queries.GetEventDetailsById;

public class GetEventDetailsByIdQuery : IRequest<EventDto>
{
    public required Guid Id { get; set; }
}
