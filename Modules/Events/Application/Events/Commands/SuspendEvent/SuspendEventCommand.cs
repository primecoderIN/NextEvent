using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.SuspendEvent;

public class SuspendEventCommand : IRequest
{
    public Guid Id { get; set; }
}
