using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using Dapper;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyOrganization;
public class GetMyOrganizationQueryHandler(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserService currentUserService) : IRequestHandler<GetMyOrganizationQuery, OrganizationDetailDto>
{
    public async Task<OrganizationDetailDto> Handle(GetMyOrganizationQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedException("User is not authenticated");

        var orgId = currentUserService.GetCurrentOrganizationId();
        if (orgId == null)
            throw new NotFoundException("Organization", "My");

        using var connection = connectionFactory.CreateConnection();
        var sql = @"
            SELECT TOP 1 
                o.Id, o.Name, o.Slug, o.Description, o.LogoUrl, o.CoverImageUrl, o.WebsiteUrl,
                o.ContactEmail, o.ContactPhone, o.Status, o.OwnerUserId,
                u.DisplayName AS OwnerDisplayName, o.CreatedAtUtc
            FROM Organizations o
            JOIN AspNetUsers u ON o.OwnerUserId = u.Id
            WHERE o.Id = @OrgId AND o.IsDeleted = 0";

        var org = await connection.QueryFirstOrDefaultAsync<OrganizationDetailDto>(sql, new { OrgId = orgId });

        if (org == null)
            throw new NotFoundException("Organization", "My");

        return org;
    }
}
