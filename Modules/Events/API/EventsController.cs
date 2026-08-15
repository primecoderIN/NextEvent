using NextEvent.Shared.Constants;
using NextEvent.Modules.Events.Application.Events.Commands.CreateEvent;
using NextEvent.Modules.Events.Application.Events.Commands.EditEvent;
using NextEvent.Modules.Events.Application.Events.Commands.DeleteEvent;
using NextEvent.Modules.Events.Application.Events.Commands.SuspendEvent;
using NextEvent.Modules.Events.Application.Events.Commands.UnsuspendEvent;
using NextEvent.Modules.Events.Application.Events.Commands.ReportEvent;
using NextEvent.Modules.Events.Application.Events.Queries.GetEventsList;
using NextEvent.Modules.Events.Application.Events.Queries.GetEventReports;
using NextEvent.Modules.Events.Application.Events.Queries.GetEventDetailsById;
using NextEvent.Modules.Events.Application.Events.DTOs;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Identity.Domain;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace NextEvent.Modules.Events.API;
// Using explicit routing ("api/events") rather than "[controller]" prevents 
// breaking API contracts if the class name changes in the future.
[Route(ApiRouteConstants.Events.Base)]
public class EventsController(IMediator mediator) : BaseApiController(mediator)
{
    /// <summary>
    /// Retrieves a paginated list of events.
    /// </summary>
    /// <response code="200">Events retrieved successfully.</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedList<EventResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedList<EventResponseDto>>>> GetEvents(
        [FromQuery] GetEventsQueryDto queryDto,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEventsListQuery 
        { 
            Q = queryDto.Q,
            CategoryId = queryDto.CategoryId,
            City = queryDto.City,
            DateFrom = queryDto.DateFrom,
            DateTo = queryDto.DateTo,
            OrganizationId = queryDto.OrganizationId,
            PageNumber = queryDto.PageNumber, 
            PageSize = queryDto.PageSize 
        };
        var events = await Mediator.Send(query, cancellationToken);
        return OkResponse(events, "Events retrieved successfully");
    }

    /// <summary>
    /// Retrieves a paginated list of events for the current organizer.
    /// </summary>
    [Authorize(Policy = "ActiveOrganizer")]
    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<PagedList<EventResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedList<EventResponseDto>>>> GetMyEvents(
        [FromQuery] GetEventsQueryDto queryDto,
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Events.Queries.GetMyEventsList.GetMyEventsListQuery 
        { 
            Q = queryDto.Q,
            CategoryId = queryDto.CategoryId,
            City = queryDto.City,
            DateFrom = queryDto.DateFrom,
            DateTo = queryDto.DateTo,
            OrganizationId = queryDto.OrganizationId,
            PageNumber = queryDto.PageNumber, 
            PageSize = queryDto.PageSize 
        };
        var events = await Mediator.Send(query, cancellationToken);
        return OkResponse(events, "Events retrieved successfully");
    }

    /// <summary>
    /// Retrieves a paginated list of all events for admins.
    /// </summary>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpGet("admin")]
    [ProducesResponseType(typeof(ApiResponse<PagedList<EventResponseDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<PagedList<EventResponseDto>>>> GetAdminEvents(
        [FromQuery] GetEventsQueryDto queryDto,
        CancellationToken cancellationToken = default)
    {
        var query = new Application.Events.Queries.GetAdminEventsList.GetAdminEventsListQuery 
        { 
            Q = queryDto.Q,
            CategoryId = queryDto.CategoryId,
            City = queryDto.City,
            DateFrom = queryDto.DateFrom,
            DateTo = queryDto.DateTo,
            OrganizationId = queryDto.OrganizationId,
            Status = queryDto.Status,
            PageNumber = queryDto.PageNumber, 
            PageSize = queryDto.PageSize 
        };
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
    /// Creates a new event.
    /// Restricted to organizers holding the ActiveOrganizer authorization policy.
    /// </summary>
    /// <param name="dto">Event creation payload (title, description, category, date, venue, location).</param>
    /// <param name="cancellationToken">Propagates cancellation notification.</param>
    /// <response code="201">Event created successfully. Returns the new Event Id.</response>
    /// <response code="400">Validation failure (e.g. past date or missing fields).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not satisfy the ActiveOrganizer policy.</response>
    // SECURITY (BFLA): The 'ActiveOrganizer' policy guarantees that ONLY users with an active organizer profile
    // can reach this endpoint. This prevents basic members or anonymous users from executing mutating actions 
    // (Broken Function Level Authorization).
    [Authorize(Policy = "ActiveOrganizer")]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
    [Authorize(Policy = "ActiveOrganizer")]
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
    [Authorize(Policy = "ActiveOrganizer")]
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

    /// <summary>
    /// Suspends an event, hiding it from public queries. Restricted to platform admins.
    /// </summary>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpPost("{id}/suspend")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> SuspendEvent(
        Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new SuspendEventCommand { Id = id }, cancellationToken);
        return OkResponse<object>(null!, "Event suspended successfully");
    }

    /// <summary>
    /// Unsuspends an event, making it visible to public queries again. Restricted to platform admins.
    /// </summary>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpPost("{id}/unsuspend")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> UnsuspendEvent(
        Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new UnsuspendEventCommand { Id = id }, cancellationToken);
        return OkResponse<object>(null!, "Event suspension revoked successfully");
    }

    /// <summary>
    /// Reports an event for moderation. Restricted to logged-in users who are not part of an organization.
    /// </summary>
    [Authorize]
    [HttpPost("{id}/report")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> ReportEvent(
        Guid id,
        [FromBody] ReportEventDto dto,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(new ReportEventCommand { Id = id, Reason = dto.Reason }, cancellationToken);
        return OkResponse<object>(null!, "Event reported successfully");
    }

    /// <summary>
    /// Gets all reports for a specific event. Restricted to platform admins.
    /// </summary>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpGet("{id}/reports")]
    [ProducesResponseType(typeof(ApiResponse<List<EventReportDto>>), StatusCodes.Status200OK)]
    public async Task<ActionResult<ApiResponse<List<EventReportDto>>>> GetEventReports(
        Guid id,
        CancellationToken cancellationToken)
    {
        var reports = await Mediator.Send(new GetEventReportsQuery { EventId = id }, cancellationToken);
        return OkResponse(reports);
    }
}
