using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.UpdateOrganizationMemberRoles;

public class UpdateOrganizationMemberRolesCommand : IRequest
{
    public Guid OrganizationId { get; set; }
    public Guid MemberId { get; set; }
    public List<Guid> RoleIds { get; set; } = new();
}
