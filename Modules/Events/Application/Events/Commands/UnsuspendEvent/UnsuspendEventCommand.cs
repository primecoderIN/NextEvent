using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.UnsuspendEvent;

public class UnsuspendEventCommand : IRequest
{
    public Guid Id { get; set; }
}
