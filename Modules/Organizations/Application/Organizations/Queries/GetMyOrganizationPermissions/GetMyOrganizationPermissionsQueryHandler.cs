using MediatR;
using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganizationPermissions;

public class GetMyOrganizationPermissionsQueryHandler(
    IOrganizationAuthorizationService authorizationService)
    : IRequestHandler<GetMyOrganizationPermissionsQuery, List<string>>
{
    public async Task<List<string>> Handle(GetMyOrganizationPermissionsQuery request, CancellationToken cancellationToken)
    {
        // If the user is a platform admin, they implicitly have all permissions.
        // We can either return a special token like "*" or let the frontend rely on user.roles.
        // The frontend useOrganizationPermissions hook already checks `user.roles.includes('Admin')`,
        // so returning the actual assigned org permissions is fine.
        
        return await authorizationService.GetUserPermissionsAsync(request.OrganizationId, cancellationToken);
    }
}
