using MediatR;

namespace Application.Organizations.Commands.AcceptOrganizationInvitation;

public class AcceptOrganizationInvitationCommand : IRequest
{
    public Guid OrganizationId { get; set; }
}
