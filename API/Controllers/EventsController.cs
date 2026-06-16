using API.Common;
using Application.Events.Commands;
using Application.Events.DTOs;
using Application.Events.Quaries;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class EventsController : BaseApiController
{
    /// <summary>
    /// GET /api/events
    /// Returns all events wrapped in ApiResponse.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<Event>>>> GetEvents(
        CancellationToken cancellationToken)
    {
        var events = await Mediator.Send(new GetEventsList.Query(), cancellationToken);
        return OkResponse(events, "Events retrieved successfully");
    }

    /// <summary>
    /// GET /api/events/{id}
    /// Returns a single event. Handler throws NotFoundException → middleware returns 404.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<Event>>> GetEventById(
        string id,
        CancellationToken cancellationToken)
    {
        var eventEntity = await Mediator.Send(
            new GetEventDetailsById.Query { Id = id },
            cancellationToken);

        return OkResponse(eventEntity, "Event retrieved successfully");
    }

    /// <summary>
    /// POST /api/events
    /// Creates a new event and returns 201 Created with the new resource's id.
    /// ValidationBehavior runs before the handler; failures produce a 400 automatically.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> CreateNewEvent(
        [FromBody] CreateEventDto dto,
        CancellationToken cancellationToken)
    {
        var id = await Mediator.Send(
            new CreateEvent.Command { Event = dto },
            cancellationToken);

        return CreatedResponse(
            actionName: nameof(GetEventById),
            routeValues: new { id },
            data: (object)new { id },
            message: "Event created successfully");
    }

    /// <summary>
    /// PUT /api/events/{id}
    /// Updates an existing event. Handler throws NotFoundException → middleware returns 404.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateEvent(
        string id,
        [FromBody] UpdateEventDto dto,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new EditEvent.Command { Id = id, EventData = dto },
            cancellationToken);

        return OkResponse<object>(null!, "Event updated successfully");
    }

    /// <summary>
    /// DELETE /api/events/{id}
    /// Deletes an event. Handler throws NotFoundException → middleware returns 404.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteEvent(
        string id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new DeleteEvent.Command { Id = id },
            cancellationToken);

        return OkResponse<object>(null!, "Event deleted successfully");
    }
}
