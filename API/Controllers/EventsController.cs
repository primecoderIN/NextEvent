using API.Common;
using Application.Events.Commands.CreateEvent;
using Application.Events.Commands.EditEvent;
using Application.Events.Commands.DeleteEvent;
using Application.Events.Queries.GetEventsList;
using Application.Events.Queries.GetEventDetailsById;
using Application.Events.DTOs;
using Application.Core.Pagination;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
// using Domain;
// using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

// Using explicit routing ("api/events") rather than "[controller]" prevents 
// breaking API contracts if the class name changes in the future.
[Route(ApiRouteConstants.Events.Base)]
public class EventsController : BaseApiController
{
    /// <summary>
    /// Retrieves a paginated list of events.
    /// </summary>
    /// <response code="200">Events retrieved successfully.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedList<EventResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedList<EventResponseDto>>>> GetEvents(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEventsListQuery { PageNumber = pageNumber, PageSize = pageSize };
        var events = await Mediator.Send(query, cancellationToken);
        return OkResponse(events, "Events retrieved successfully");
    }

    /// <summary>
    /// Retrieves the details of a specific event by its unique ID.
    /// </summary>
    /// <response code="200">Event retrieved successfully.</response>
    /// <response code="404">No event exists with the provided ID.</response>
    [HttpGet(ApiRouteConstants.Events.Id)]
    [ProducesResponseType(typeof(ApiResponse<EventResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<EventResponseDto>>> GetEventById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var eventEntity = await Mediator.Send(
            new GetEventDetailsByIdQuery { Id = id },
            cancellationToken);

        return OkResponse(eventEntity, "Event retrieved successfully");
    }

    /// <summary>
    /// Creates a new event and returns the new resource's ID.
    /// </summary>
    /// <response code="201">Event created successfully.</response>
    /// <response code="400">Validation failure.</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
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
    /// Updates an existing event.
    /// </summary>
    /// <response code="200">Event updated successfully.</response>
    /// <response code="400">Validation failure.</response>
    /// <response code="404">No event exists with the provided ID.</response>
    [Authorize]
    [HttpPut(ApiRouteConstants.Events.Update)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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
    /// Deletes an event by its ID.
    /// </summary>
    /// <response code="200">Event deleted successfully.</response>
    /// <response code="404">No event exists with the provided ID.</response>
    [Authorize]
    [HttpDelete(ApiRouteConstants.Events.Delete)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
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
