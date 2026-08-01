using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Application.Permissions.DTOs;
using Dapper;
using MediatR;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Organizations.Application.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQueryHandler(
    ISqlConnectionFactory connectionFactory,
    IOrganizationAuthorizationService authorizationService) 
    : IRequestHandler<GetAllPermissionsQuery, List<PermissionDto>>
{
    public async Task<List<PermissionDto>> Handle(
        GetAllPermissionsQuery request, 
        CancellationToken cancellationToken)
    {
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.RolesManage, cancellationToken);
        using var connection = connectionFactory.CreateConnection();

        const string sql = """
            SELECT Id, 
                   Code, 
                   Name, 
                   Description, 
                   Category
            FROM [org].[Permissions]
            ORDER BY Category, Name
            """;

        var permissions = await connection.QueryAsync<PermissionDto>(sql);

        return permissions.ToList();
    }
}
