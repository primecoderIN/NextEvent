using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganizationPermissions;

public class GetMyOrganizationPermissionsQuery : IRequest<List<string>>
{
    public Guid OrganizationId { get; set; }
}
