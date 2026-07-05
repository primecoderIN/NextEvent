using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Commands.CreateEvent;

public class CreateEventCommand : IRequest<Guid>
{
    public required CreateEventDto Event { get; set; }
}
