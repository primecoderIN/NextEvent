// using MediatR;

namespace Application.Events.Commands.DeleteEvent;

/// <summary>
/// Returns <see cref="Unit"/> (void equivalent) on success.
/// Throws <see cref="NotFoundException"/> when the event does not exist,
/// allowing the middleware to produce a 404 ApiResponse automatically.
/// </summary>
public class DeleteEventCommand : IRequest<Unit>
{
    public required Guid Id { get; set; }
}
