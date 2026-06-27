// using MediatR;
using Application.Events.DTOs;

namespace Application.Events.Commands.CreateEvent;

public class CreateEventCommand : IRequest<Guid>
{
    public required CreateEventDto Event { get; set; }
}
