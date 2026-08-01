using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using Dapper;
using MediatR;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationRoles;

public class GetOrganizationRolesListQueryHandler(
    ISqlConnectionFactory connectionFactory,
    IOrganizationAuthorizationService authorizationService)
    : IRequestHandler<GetOrganizationRolesListQuery, List<OrganizationRoleDto>>
{
    public async Task<List<OrganizationRoleDto>> Handle(
        GetOrganizationRolesListQuery request,
        CancellationToken cancellationToken)
    {
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.RolesManage, cancellationToken);

        using var connection = connectionFactory.CreateConnection();

        const string sql = """
            SELECT r.Id, r.Name, r.Description, r.IsSystemRole
            FROM [org].[OrganizationRoles] r
            WHERE r.OrganizationId = @OrganizationId AND r.IsDeleted = 0;

            SELECT rp.OrganizationRoleId, p.Code
            FROM [org].[OrganizationRolePermissions] rp
            INNER JOIN [org].[Permissions] p ON rp.PermissionId = p.Id
            INNER JOIN [org].[OrganizationRoles] r ON rp.OrganizationRoleId = r.Id
            WHERE r.OrganizationId = @OrganizationId AND r.IsDeleted = 0;
            """;

        using var multi = await connection.QueryMultipleAsync(sql, new { request.OrganizationId });

        var roles = (await multi.ReadAsync<OrganizationRoleDto>()).ToList();
        var permissions = (await multi.ReadAsync<dynamic>()).ToList();

        var permissionsLookup = permissions
            .GroupBy(x => (Guid)x.OrganizationRoleId)
            .ToDictionary(g => g.Key, g => g.Select(x => (string)x.Code).ToList());

        foreach (var role in roles)
        {
            if (permissionsLookup.TryGetValue(role.Id, out var rolePerms))
            {
                role.Permissions = rolePerms;
            }
        }

        return roles;
    }
}
