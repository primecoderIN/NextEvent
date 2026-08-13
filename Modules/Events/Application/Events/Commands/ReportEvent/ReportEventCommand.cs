using MediatR;

namespace NextEvent.Modules.Events.Application.Events.Commands.ReportEvent;

public class ReportEventCommand : IRequest
{
    public Guid Id { get; set; }
    public required string Reason { get; set; }
}
