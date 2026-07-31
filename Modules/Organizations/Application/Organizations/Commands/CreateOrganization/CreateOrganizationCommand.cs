using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization;
/// <summary>
/// Creates a new organization, seeds its 5 default system roles with permissions,
/// and adds the requesting user as the active owner member.
/// Returns the newly created organization's <see cref="Guid"/> Id.
/// </summary>
public class CreateOrganizationCommand : IRequest<Guid>
{
    public required CreateOrganizationDto Organization { get; set; }
}
