using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganizationRole;
public class CreateOrganizationRoleCommand : IRequest<Guid>
{
    public required Guid OrganizationId { get; set; }
    public required CreateOrganizationRoleDto Role { get; set; }
}
