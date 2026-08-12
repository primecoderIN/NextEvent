using MediatR;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyInvitations;

public class GetMyInvitationsQuery : IRequest<List<OrganizationInvitationDto>>
{
}
