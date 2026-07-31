using NextEvent.Modules.Organizations.Application.Permissions.DTOs;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Permissions.Queries.GetAllPermissions;
/// <summary>
/// Retrieves the list of all available system permissions.
/// Used by the frontend to populate role management UIs.
/// </summary>
public class GetAllPermissionsQuery : IRequest<List<PermissionDto>>
{
    public Guid OrganizationId { get; set; }
}
