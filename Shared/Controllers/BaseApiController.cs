using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Mvc;
using NextEvent.Shared.Common;
using MediatR;

namespace NextEvent.Shared.Controllers;

/// <summary>
/// Base controller for all API controllers.
/// Provides access to MediatR without requiring constructor injection in every controller,
/// plus thin helper methods to produce consistent <see cref="ApiResponse{T}"/> responses.
/// </summary>
[ApiController]
public class BaseApiController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Gets the IMediator instance for dispatching CQRS requests.
    /// </summary>
    protected IMediator Mediator => mediator;

    // -----------------------------------------------------------------------
    // ApiResponse<T> helper methods — keep controller actions thin
    // -----------------------------------------------------------------------

    /// <summary>Returns HTTP 200 OK with an <see cref="ApiResponse{T}"/> envelope.</summary>
    protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string message = "Request completed successfully") =>
        Ok(ApiResponse.Ok(data, message));

    /// <summary>Returns HTTP 201 Created with an <see cref="ApiResponse{T}"/> envelope.</summary>
    protected ActionResult<ApiResponse<T>> CreatedResponse<T>(
        string actionName,
        object routeValues,
        T data,
        string message = "Resource created successfully") =>
        CreatedAtAction(actionName, routeValues, ApiResponse.Created(data, message));
}
