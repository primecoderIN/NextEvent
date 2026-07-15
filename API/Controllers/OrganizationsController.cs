using API.Common;
using Application.Organizations.Commands.CreateOrganization;
using Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Route(ApiRouteConstants.Organizations.Base)]
public class OrganizationsController : BaseApiController
{
    /// <summary>
    /// Creates a new organization.
    /// The requesting user becomes the owner, is added as an active member,
    /// and is assigned the Owner role with full permissions.
    /// Five default system roles are seeded automatically.
    /// The organization starts with status <c>pending_verification</c>.
    /// </summary>
    /// <response code="201">Organization created successfully. Returns the new organization Id.</response>
    /// <response code="400">Validation failure (e.g. invalid slug format, missing name).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="409">Slug is already taken by another organization.</response>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<object>>> CreateOrganization(
        [FromBody] CreateOrganizationDto dto,
        CancellationToken cancellationToken)
    {
        var id = await Mediator.Send(
            new CreateOrganizationCommand { Organization = dto },
            cancellationToken);

        return CreatedResponse(
            actionName: nameof(GetOrganizationById),
            routeValues: new { id },
            data: (object)new { id },
            message: "Organization created successfully. It is pending admin verification.");
    }

    /// <summary>
    /// Retrieves an organization by its Id.
    /// Placeholder — query handler to be implemented in a future slice.
    /// </summary>
    /// <response code="501">Not yet implemented.</response>
    [HttpGet(ApiRouteConstants.Organizations.Id)]
    public IActionResult GetOrganizationById(Guid id) =>
        StatusCode(StatusCodes.Status501NotImplemented);
}
