using NextEvent.Modules.Events.Application.Events.DTOs;
using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.CreateEvent;
public class CreateEventCommand : IRequest<Guid>
{
    public required CreateEventDto Event { get; set; }
}
