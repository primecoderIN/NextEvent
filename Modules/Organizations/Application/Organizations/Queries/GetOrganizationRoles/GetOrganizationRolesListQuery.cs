using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationRoles;
public class GetOrganizationRolesListQuery : IRequest<List<OrganizationRoleDto>>
{
    public Guid OrganizationId { get; set; }
}
