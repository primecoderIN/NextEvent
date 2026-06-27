using API.Common;
using Application.Events.Commands.CreateEvent;
using Application.Events.Commands.EditEvent;
using Application.Events.Commands.DeleteEvent;
using Application.Events.Queries.GetEventsList;
using Application.Events.Queries.GetEventDetailsById;
using Application.Events.DTOs;
using Domain;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

// Using explicit routing ("api/events") rather than "[controller]" prevents 
// breaking API contracts if the class name changes in the future.
[Route("api/events")]
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
        var events = await Mediator.Send(new GetEventsListQuery(), cancellationToken);
        return OkResponse(events, "Events retrieved successfully");
    }

    /// <summary>
    /// GET /api/events/{id}
    /// Returns a single event. Handler throws NotFoundException → middleware returns 404.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<Event>>> GetEventById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var eventEntity = await Mediator.Send(
            new GetEventDetailsByIdQuery { Id = id },
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
            new CreateEventCommand { Event = dto },
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
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateEvent(
        Guid id,
        [FromBody] UpdateEventDto dto,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new EditEventCommand { Id = id, EventData = dto },
            cancellationToken);

        return OkResponse<object>(null!, "Event updated successfully");
    }

    /// <summary>
    /// DELETE /api/events/{id}
    /// Deletes an event. Handler throws NotFoundException → middleware returns 404.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteEvent(
        Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new DeleteEventCommand { Id = id },
            cancellationToken);

        return OkResponse<object>(null!, "Event deleted successfully");
    }
}
