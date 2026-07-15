using API.Common;
using Application.Permissions.DTOs;
using Application.Permissions.Queries.GetAllPermissions;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route(ApiRouteConstants.Permissions.Base)]
public class PermissionsController : BaseApiController
{
    /// <summary>
    /// Retrieves a list of all available system permissions.
    /// This is used by the frontend to render the permission selection matrix
    /// when managing organization roles.
    /// </summary>
    /// <response code="200">Returns the list of permissions grouped by category.</response>
    /// <response code="401">No valid JWT supplied.</response>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<PermissionDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<PermissionDto>>>> GetAllPermissions(
        CancellationToken cancellationToken)
    {
        var permissions = await Mediator.Send(new GetAllPermissionsQuery(), cancellationToken);

        return OkResponse(permissions, "Permissions retrieved successfully.");
    }
}
