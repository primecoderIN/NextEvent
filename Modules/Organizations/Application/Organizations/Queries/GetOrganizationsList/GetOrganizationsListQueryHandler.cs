using NextEvent.Shared.Interfaces;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;

using Dapper;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationsList;
public class GetOrganizationsListQueryHandler(ISqlConnectionFactory connectionFactory) : IRequestHandler<GetOrganizationsListQuery, PagedList<OrganizationDetailDto>>
{
    public async Task<PagedList<OrganizationDetailDto>> Handle(GetOrganizationsListQuery request, CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        var offset = (request.PageNumber - 1) * request.PageSize;
        var limit = request.PageSize;

        const string sql = """
            SELECT o.Id,
                   o.Name,
                   o.Slug,
                   o.Description,
                   o.LogoUrl,
                   o.CoverImageUrl,
                   o.WebsiteUrl,
                   o.ContactEmail,
                   o.ContactPhone,
                   o.Status,
                   o.OwnerUserId,
                   u.DisplayName AS OwnerDisplayName,
                   o.CreatedAtUtc
            FROM   [org].[Organizations] o
            INNER JOIN [identity].[AspNetUsers] u ON u.Id = o.OwnerUserId
            WHERE  o.IsDeleted = 0
            ORDER BY o.CreatedAtUtc DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;
            
            SELECT COUNT(*)
            FROM   [org].[Organizations] o
            WHERE  o.IsDeleted = 0;
            """;

        using var multi = await connection.QueryMultipleAsync(sql, new { Offset = offset, Limit = limit });

        var organizations = (await multi.ReadAsync<OrganizationDetailDto>()).ToList();
        var totalCount = await multi.ReadFirstAsync<int>();

        return new PagedList<OrganizationDetailDto>(organizations, totalCount, request.PageNumber, request.PageSize);
    }
}
