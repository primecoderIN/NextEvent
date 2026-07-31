using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.AcceptOrganizationInvitation;
public class AcceptOrganizationInvitationCommand : IRequest
{
    public Guid OrganizationId { get; set; }
}
