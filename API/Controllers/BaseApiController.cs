using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

/// <summary>
/// Base controller for all API controllers.
/// Provides access to MediatR without requiring
/// constructor injection in every controller.
/// </summary>
[Route("api/[controller]")]
[ApiController]
public class BaseApiController : ControllerBase
{
    // Backing field for lazy initialization
    private IMediator? _mediator;

    /// <summary>
    /// Gets the IMediator instance from the Dependency Injection container.
    /// The mediator is resolved only on first access and then cached.
    /// </summary>
    protected IMediator Mediator =>
        _mediator ??=
            HttpContext.RequestServices.GetService<IMediator>()
            ?? throw new InvalidOperationException(
                "IMediator is not available"
            );
}