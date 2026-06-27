using Application.Events.DTOs;
using MediatR;

namespace Application.Events.Commands.EditEvent;

/// <summary>
/// Returns <see cref="Unit"/> (void equivalent) on success.
/// Throws <see cref="NotFoundException"/> when the event does not exist,
/// allowing the middleware to produce a 404 ApiResponse automatically.
/// </summary>
public class EditEventCommand : IRequest<Unit>
{
    public required string Id { get; set; }
    public required UpdateEventDto EventData { get; set; }
}
