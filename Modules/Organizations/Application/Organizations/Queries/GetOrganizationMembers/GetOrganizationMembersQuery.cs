using MediatR;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationMembers;

public class GetOrganizationMembersQuery : IRequest<List<OrganizationMemberDto>>
{
    public Guid OrganizationId { get; set; }
}
