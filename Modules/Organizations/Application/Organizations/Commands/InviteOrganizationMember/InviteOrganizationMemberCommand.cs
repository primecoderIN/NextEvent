using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.InviteOrganizationMember;
public class InviteOrganizationMemberCommand : IRequest<Guid>
{
    public Guid OrganizationId { get; set; }
    public required string Email { get; set; }
}
