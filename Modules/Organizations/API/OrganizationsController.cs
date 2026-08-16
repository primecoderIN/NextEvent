using NextEvent.Shared.Constants;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.ApproveOrganization;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationById;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationBySlug;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationsList;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganization;
using NextEvent.Shared.Constants;
using NextEvent.Modules.Organizations.Application.Organizations.Commands.UpdateOrganizationMemberRoles;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationMembers;
using Microsoft.AspNetCore.Authorization;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyInvitations;

namespace NextEvent.Modules.Organizations.API;
[Route(ApiRouteConstants.Organizations.Base)]
public class OrganizationsController(IMediator mediator) : BaseApiController(mediator)
{
    /// <summary>
    /// Retrieves a paginated list of all organizations.
    /// Restricted to platform Admins only.
    /// </summary>
    /// <response code="200">Organizations retrieved successfully.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedList<OrganizationDetailDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<PagedList<OrganizationDetailDto>>>> GetOrganizationsList(
        [FromQuery] PaginationParams paginationParams,
        CancellationToken cancellationToken)
    {
        var organizations = await Mediator.Send(
            new GetOrganizationsListQuery 
            { 
                PageNumber = paginationParams.PageNumber, 
                PageSize = paginationParams.PageSize 
            }, 
            cancellationToken);

        return OkResponse(organizations, "Organizations retrieved successfully.");
    }

    /// <summary>
    /// Creates a new organization.
    /// The requesting user becomes the owner, is added as an active member,
    /// and is assigned the Owner role with full permissions.
    /// Five default system roles are seeded automatically.
    /// The organization starts with status <c>pending_verification</c>.
    /// </summary>
    /// <response code="201">Organization created. Returns the new organization Id.</response>
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
    /// Retrieves a single organization by its Id.
    /// Soft-deleted organizations return 404.
    /// </summary>
    /// <response code="200">Organization found.</response>
    /// <response code="404">No organization exists with the given Id.</response>
    [Authorize]
    [HttpGet(ApiRouteConstants.Organizations.Id)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<OrganizationDetailDto>>> GetOrganizationById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var org = await Mediator.Send(
            new GetOrganizationByIdQuery { Id = id },
            cancellationToken);

        return OkResponse(org, "Organization retrieved successfully.");
    }

    /// <summary>
    /// Retrieves the active organization owned by the current authenticated user.
    /// </summary>
    /// <response code="200">Organization found.</response>
    /// <response code="404">User does not own any organization.</response>
    [Authorize]
    [HttpGet("my")]
    [ProducesResponseType(typeof(ApiResponse<OrganizationDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<OrganizationDetailDto>>> GetMyOrganization(
        CancellationToken cancellationToken)
    {
        var org = await Mediator.Send(new GetMyOrganizationQuery(), cancellationToken);
        return OkResponse(org, "Organization retrieved successfully.");
    }

    /// <summary>
    /// Retrieves all pending organization invitations for the current authenticated user.
    /// </summary>
    /// <response code="200">Invitations retrieved.</response>
    /// <response code="401">No valid JWT supplied.</response>
    [Authorize]
    [HttpGet("my-invitations")]
    [ProducesResponseType(typeof(ApiResponse<List<OrganizationInvitationDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<OrganizationInvitationDto>>>> GetMyInvitations(
        CancellationToken cancellationToken)
    {
        var invitations = await Mediator.Send(new GetMyInvitationsQuery(), cancellationToken);
        return OkResponse(invitations, "Invitations retrieved successfully.");
    }

    /// <summary>
    /// Retrieves all dynamic permission codes the current authenticated user holds within the specified organization.
    /// </summary>
    /// <response code="200">Permissions retrieved.</response>
    /// <response code="401">No valid JWT supplied.</response>
    [Authorize]
    [HttpGet("{id:guid}/my-permissions")]
    [ProducesResponseType(typeof(ApiResponse<List<string>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetMyOrganizationPermissions(
        Guid id,
        CancellationToken cancellationToken)
    {
        var permissions = await Mediator.Send(new NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganizationPermissions.GetMyOrganizationPermissionsQuery { OrganizationId = id }, cancellationToken);
        return OkResponse(permissions, "Permissions retrieved successfully.");
    }

    /// <summary>
    /// Approves a pending organization.
    /// Sets status to <c>active</c> and grants the ASP.NET Identity
    /// <c>Organizer</c> platform role to the organization's owner.
    /// Restricted to platform Admins only.
    /// </summary>
    /// <response code="200">Organization approved successfully.</response>
    /// <response code="400">Organization is already active, suspended, or rejected.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller does not hold the Admin platform role.</response>
    /// <response code="404">No organization exists with the given Id.</response>
    [Authorize(Roles = RoleConstants.Admin)]
    [HttpPost(ApiRouteConstants.Organizations.Approve)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> ApproveOrganization(
        Guid id,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new ApproveOrganizationCommand { OrganizationId = id },
            cancellationToken);

        return OkResponse<object>(null!, "Organization approved. Owner has been granted the Organizer role.");
    }

    /// <summary>
    /// Returns the public profile of an organization identified by its slug,
    /// along with its upcoming (future, non-cancelled) events.
    /// No authentication required — this is a public, unauthenticated endpoint.
    /// Only organizations with status <c>active</c> are returned; pending, suspended,
    /// and rejected organizations respond with 404 to avoid information leakage.
    /// </summary>
    /// <param name="slug">The URL-friendly slug, e.g. "acme-events".</param>
    /// <param name="cancellationToken">Propagates notification that the operation should be cancelled.</param>
    /// <response code="200">Public profile found.</response>
    /// <response code="404">No active organization exists with the given slug.</response>
    [AllowAnonymous]
    [HttpGet(ApiRouteConstants.Organizations.Slug)]
    [ProducesResponseType(typeof(ApiResponse<OrganizationPublicProfileDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<OrganizationPublicProfileDto>>> GetOrganizationBySlug(
        string slug,
        CancellationToken cancellationToken)
    {
        var profile = await Mediator.Send(
            new GetOrganizationBySlugQuery { Slug = slug },
            cancellationToken);

        return OkResponse(profile, "Organization profile retrieved successfully.");
    }
    /// <summary>
    /// Retrieves all members belonging to an organization.
    /// Caller must have the organization.view permission.
    /// </summary>
    /// <response code="200">List of members retrieved.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller lacks the required permission.</response>
    [Authorize]
    [HttpGet("{id:guid}/members")]
    [ProducesResponseType(typeof(ApiResponse<List<OrganizationMemberDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<ApiResponse<List<OrganizationMemberDto>>>> GetOrganizationMembers(
        Guid id,
        CancellationToken cancellationToken)
    {
        var members = await Mediator.Send(
            new GetOrganizationMembersQuery { OrganizationId = id },
            cancellationToken);

        return OkResponse(members, "Members retrieved successfully.");
    }

    /// <summary>
    /// Updates the roles for a given member.
    /// Caller must have the organization.roles.manage permission.
    /// </summary>
    /// <response code="200">Roles updated successfully.</response>
    /// <response code="400">Validation failure (e.g. invalid roles).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller lacks the required permission.</response>
    /// <response code="404">Member not found.</response>
    [Authorize]
    [HttpPut("{id:guid}/members/{memberId:guid}/roles")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateMemberRoles(
        Guid id,
        Guid memberId,
        [FromBody] List<Guid> roleIds,
        CancellationToken cancellationToken)
    {
        await Mediator.Send(
            new UpdateOrganizationMemberRolesCommand 
            { 
                OrganizationId = id, 
                MemberId = memberId, 
                RoleIds = roleIds 
            },
            cancellationToken);

        return OkResponse<object>(null!, "Member roles updated successfully.");
    }

    /// <summary>
    /// Invites a registered user to join the organization.
    /// The invited user receives the 'Member' system role by default.
    /// Requires the caller to have the 'members.invite' permission.
    /// </summary>
    /// <response code="200">User invited successfully. Returns the new membership Id.</response>
    /// <response code="400">Validation failure or user is already a member/invited.</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="403">Caller lacks the required permission in the organization.</response>
    /// <response code="404">User with the given email not found.</response>
    // SECURITY (BFLA/BOLA): We don't apply [Authorize(Policy = "ActiveOrganizer")] at the controller level
    // because this controller has mixed endpoints (public read, admin actions, user actions). 
    // However, the BOLA protection happens in the InviteOrganizationMemberCommandHandler where we 
    // strictly authorize against the OrganizationId from the route.
    [Authorize]
    [HttpPost("{id:guid}/members/invite")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> InviteMember(
        Guid id,
        [FromBody] Application.Organizations.Commands.InviteOrganizationMember.InviteOrganizationMemberCommand command,
        CancellationToken cancellationToken)
    {
        // Ensure the ID from the route matches the ID in the command (if you want to keep it clean)
        command.OrganizationId = id;
        
        var membershipId = await Mediator.Send(command, cancellationToken);
        
        return OkResponse((object)new { id = membershipId }, "User invited successfully.");
    }
    /// <summary>
    /// Accepts an invitation to join the organization.
    /// The caller must be the user who was invited (must be authenticated).
    /// </summary>
    /// <response code="200">Invitation accepted successfully.</response>
    /// <response code="400">Invitation is invalid (declined or already active).</response>
    /// <response code="401">No valid JWT supplied.</response>
    /// <response code="404">Invitation not found.</response>
    [Authorize]
    [HttpPost("{id:guid}/members/accept-invite")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ApiResponse<object>>> AcceptInvite(
        Guid id,
        CancellationToken cancellationToken)
    {
        var command = new Application.Organizations.Commands.AcceptOrganizationInvitation.AcceptOrganizationInvitationCommand
        {
            OrganizationId = id
        };
        
        await Mediator.Send(command, cancellationToken);
        
        return OkResponse<object>(null!, "Invitation accepted successfully.");
    }
}
