using NextEvent.Shared.Constants;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganizationRole;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.UpdateOrganizationRole;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationRoles;
using NextEvent.Shared.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace NextEvent.Modules.Organizations.API;
[Route(ApiRouteConstants.Organizations.Base)]
// SECURITY (BFLA): The 'ActiveOrganizer' policy guarantees that ONLY users with an active organizer profile
// can reach ANY endpoint in this controller. This prevents basic members or anonymous users from executing 
// mutating actions or viewing roles (Broken Function Level Authorization).
[Authorize(Policy = "ActiveOrganizer")]
public class OrganizationRolesController : BaseApiController
{
    /// <summary>
    /// Retrieves all roles for the organization.
    /// Requires the user to be authenticated.
    /// </summary>
    /// <response code="200">Returns list of organization roles.</response>
    /// <response code="401">No valid JWT supplied.</response>
    [HttpGet(ApiRouteConstants.Organizations.Roles)]
    [ProducesResponseType(typeof(ApiResponse<List<OrganizationRoleDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<OrganizationRoleDto>>>> GetRoles(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await Mediator.Send(
            new GetOrganizationRolesListQuery { OrganizationId = id },
            cancellationToken);

        return OkResponse(result, "Roles retrieved successfully.");
    }

    /// <summary>
    /// Creates a custom role within the organization.
    /// Requires the user to have the 'roles.manage' permission.
    /// </summary>
    /// <response code="201">Role created successfully. Returns the new role Id.</response>
    /// <response code="400">Validation failure (e.g. invalid name, missing permissions).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">User lacks the required permission in the organization.</response>
    /// <response code="409">Role name already exists or invalid permission codes provided.</response>
    [HttpPost(ApiRouteConstants.Organizations.Roles)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<object>>> CreateRole(
        Guid id,
        [FromBody] CreateOrganizationRoleDto dto,
        CancellationToken cancellationToken)
    {
        var roleId = await Mediator.Send(
            new CreateOrganizationRoleCommand { OrganizationId = id, Role = dto },
            cancellationToken);

        // Returning 201 with a simple object, can route to a GetRole endpoint later when implemented
        return OkResponse((object)new { id = roleId }, "Role created successfully.");
    }

    /// <summary>
    /// Updates an existing role's name, description, and permissions.
    /// System roles cannot be renamed or have their descriptions changed.
    /// Requires the user to have the 'roles.manage' permission.
    /// </summary>
    /// <response code="200">Role updated successfully.</response>
    /// <response code="400">Validation failure (e.g. invalid name, missing permissions).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">User lacks the required permission in the organization.</response>
    /// <response code="404">Role not found.</response>
    /// <response code="409">Role name already exists, attempted to rename system role, or invalid permission codes.</response>
    [HttpPut(ApiRouteConstants.Organizations.Roles + "/{roleId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateRole(
        Guid id,
        Guid roleId,
        [FromBody] UpdateOrganizationRoleDto dto,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new UpdateOrganizationRoleCommand { OrganizationId = id, RoleId = roleId, Role = dto },
            cancellationToken);

        return OkResponse<object>(null!, "Role updated successfully.");
    }
}
