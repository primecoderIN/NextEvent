using MediatR;
using Application.Events.DTOs;

namespace Application.Events.Commands.CreateEvent;

public class CreateEventCommand : IRequest<string>
{
    public required CreateEventDto Event { get; set; }
}
