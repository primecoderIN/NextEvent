using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Application.Organizations.DTOs;
using Dapper;
using MediatR;

namespace Application.Organizations.Queries.GetMyOrganization;

public class GetMyOrganizationQueryHandler(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserService currentUserService) : IRequestHandler<GetMyOrganizationQuery, OrganizationDetailDto>
{
    public async Task<OrganizationDetailDto> Handle(GetMyOrganizationQuery request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            throw new UnauthorizedException("User is not authenticated");

        using var connection = connectionFactory.CreateConnection();
        var sql = @"
            SELECT TOP 1 
                o.Id, o.Name, o.Slug, o.Description, o.LogoUrl, o.CoverImageUrl, o.WebsiteUrl,
                o.ContactEmail, o.ContactPhone, o.Status, o.OwnerUserId,
                u.DisplayName AS OwnerDisplayName, o.CreatedAtUtc
            FROM Organizations o
            JOIN AspNetUsers u ON o.OwnerUserId = u.Id
            WHERE o.OwnerUserId = @UserId AND o.IsDeleted = 0
            ORDER BY o.CreatedAtUtc DESC";

        var org = await connection.QueryFirstOrDefaultAsync<OrganizationDetailDto>(sql, new { UserId = userId });

        if (org == null)
            throw new NotFoundException("Organization", "My");

        return org;
    }
}
