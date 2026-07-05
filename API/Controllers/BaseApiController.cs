using API.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Base controller for all API controllers.
/// Provides access to MediatR without requiring constructor injection in every controller,
/// plus thin helper methods to produce consistent <see cref="ApiResponse{T}"/> responses.
/// </summary>
[ApiController]
public class BaseApiController : ControllerBase
{
    // Backing field for lazy initialization
    private IMediator? _mediator;

    /// <summary>
    /// Gets the IMediator instance from the Dependency Injection container.
    /// Resolved lazily on first access and then cached for the lifetime of the request.
    /// </summary>
    protected IMediator Mediator =>
        _mediator ??=
            HttpContext.RequestServices.GetService<IMediator>()
            ?? throw new InvalidOperationException(
                "IMediator is not available"
            );

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
