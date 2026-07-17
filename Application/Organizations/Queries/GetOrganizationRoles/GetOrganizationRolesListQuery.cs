using Application.Organizations.DTOs;
using MediatR;

namespace Application.Organizations.Queries.GetOrganizationRoles;

public class GetOrganizationRolesListQuery : IRequest<List<OrganizationRoleDto>>
{
    public Guid OrganizationId { get; set; }
}
