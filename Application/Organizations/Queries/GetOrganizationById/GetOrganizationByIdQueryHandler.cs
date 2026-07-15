using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Application.Organizations.DTOs;
using Dapper;
using Domain;
using MediatR;

namespace Application.Organizations.Queries.GetOrganizationById;

/// <summary>
/// Handles <see cref="GetOrganizationByIdQuery"/> using Dapper (read side of CQRS).
/// JOINs AspNetUsers to surface the owner's display name without a second round-trip.
/// Soft-deleted organizations are excluded.
/// </summary>
public class GetOrganizationByIdQueryHandler(ISqlConnectionFactory connectionFactory)
    : IRequestHandler<GetOrganizationByIdQuery, OrganizationDetailDto>
{
    public async Task<OrganizationDetailDto> Handle(
        GetOrganizationByIdQuery request,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

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
                   u.DisplayName   AS OwnerDisplayName,
                   o.CreatedAtUtc
            FROM   Organizations o
            INNER JOIN AspNetUsers u ON u.Id = o.OwnerUserId
            WHERE  o.Id        = @Id
              AND  o.IsDeleted = 0
            """;

        var dto = await connection.QueryFirstOrDefaultAsync<OrganizationDetailDto>(
            sql, new { request.Id });

        if (dto is null)
            throw new NotFoundException(nameof(Organization), request.Id);

        return dto;
    }
}
