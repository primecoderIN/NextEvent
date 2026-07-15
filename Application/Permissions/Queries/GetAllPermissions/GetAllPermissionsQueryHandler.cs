using Application.Core.Interfaces;
using Application.Permissions.DTOs;
using Dapper;
using MediatR;

namespace Application.Permissions.Queries.GetAllPermissions;

public class GetAllPermissionsQueryHandler(ISqlConnectionFactory connectionFactory) 
    : IRequestHandler<GetAllPermissionsQuery, List<PermissionDto>>
{
    public async Task<List<PermissionDto>> Handle(
        GetAllPermissionsQuery request, 
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        const string sql = """
            SELECT Id, 
                   Code, 
                   Name, 
                   Description, 
                   Category
            FROM Permissions
            ORDER BY Category, Name
            """;

        var permissions = await connection.QueryAsync<PermissionDto>(sql);

        return permissions.ToList();
    }
}
