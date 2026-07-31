using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using Dapper;
using NextEvent.Modules.Identity.Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Shared.Constants;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationById;
/// <summary>
/// Handles <see cref="GetOrganizationByIdQuery"/> using Dapper (read side of CQRS).
/// JOINs AspNetUsers to surface the owner's display name without a second round-trip.
/// Soft-deleted organizations are excluded.
/// </summary>
public class GetOrganizationByIdQueryHandler(
    ISqlConnectionFactory connectionFactory,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService,
    OrganizationsDbContext context)
    : IRequestHandler<GetOrganizationByIdQuery, OrganizationDetailDto>
{
    public async Task<OrganizationDetailDto> Handle(
        GetOrganizationByIdQuery request,
        CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        var isAdmin = currentUserService.HasRole(RoleConstants.Admin);
        var hasViewPerm = await authorizationService
            .HasPermissionAsync(request.Id, PermissionConstants.OrganizationView, cancellationToken);
        var isOwner = await context.Organizations
            .AnyAsync(o => o.Id == request.Id && o.OwnerUserId == userId && !o.IsDeleted, cancellationToken);

        if (!isAdmin && !hasViewPerm && !isOwner)
            throw new ForbiddenAccessException("You do not have access to this organization.");

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
            FROM   [org].[Organizations] o
            INNER JOIN [identity].[AspNetUsers] u ON u.Id = o.OwnerUserId
            WHERE  o.Id        = @Id
              AND  o.IsDeleted = 0
              AND (
                  EXISTS (SELECT 1 FROM [identity].[AspNetUserRoles] ur INNER JOIN [identity].[AspNetRoles] r ON ur.RoleId = r.Id WHERE ur.UserId = @UserId AND r.Name = 'Admin')
                  OR o.OwnerUserId = @UserId
                  OR EXISTS (SELECT 1 FROM [org].[OrganizationMembers] om WHERE om.OrganizationId = o.Id AND om.UserId = @UserId AND om.Status = 1 AND om.IsDeleted = 0)
              )
            """;

        var dto = await connection.QueryFirstOrDefaultAsync<OrganizationDetailDto>(
            sql, new { request.Id, UserId = userId });

        if (dto is null)
            throw new NotFoundException(nameof(Organization), request.Id);

        return dto;
    }
}
