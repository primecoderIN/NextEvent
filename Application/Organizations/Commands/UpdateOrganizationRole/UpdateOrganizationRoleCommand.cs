using MediatR;

namespace Application.Organizations.Commands.UpdateOrganizationRole;

public class UpdateOrganizationRoleCommand : IRequest
{
    public required Guid OrganizationId { get; set; }
    public required Guid RoleId { get; set; }
    public required UpdateOrganizationRoleDto Role { get; set; }
}
