using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.ApproveOrganization;
/// <summary>
/// Approves an organization: sets Status → "active" and grants the owner
/// the ASP.NET Identity "Organizer" platform role.
/// Only accessible to platform Admins (enforced at the controller layer).
/// </summary>
public class ApproveOrganizationCommand : IRequest
{
    public required Guid OrganizationId { get; set; }
}
