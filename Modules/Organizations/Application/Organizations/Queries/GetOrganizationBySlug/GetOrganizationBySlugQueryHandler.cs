using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using Dapper;
using NextEvent.Modules.Identity.Domain;
using MediatR;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationBySlug;
/// <summary>
/// Handles <see cref="GetOrganizationBySlugQuery"/> using Dapper (read side of CQRS).
///
/// Two queries are executed:
///   1. Fetch the organization row (+ owner display name) by slug.
///   2. Fetch upcoming public events for that organization (future, non-cancelled, capped at 20).
///
/// Only organizations with Status = 'active' are exposed publicly.
/// Soft-deleted organizations are excluded.
/// </summary>
public class GetOrganizationBySlugQueryHandler(ISqlConnectionFactory connectionFactory)
    : IRequestHandler<GetOrganizationBySlugQuery, OrganizationPublicProfileDto>
{
    public async Task<OrganizationPublicProfileDto> Handle(
        GetOrganizationBySlugQuery request,
        CancellationToken cancellationToken)
    {
        using var connection = connectionFactory.CreateConnection();

        // -----------------------------------------------------------------------
        // 1. Load the organization header (public fields only)
        // -----------------------------------------------------------------------
        // Status = 'active' guard: only approved orgs get a public profile.
        // OwnerUserId is intentionally excluded from SELECT — only DisplayName
        // is exposed so anonymous callers cannot enumerate internal user IDs.
        // -----------------------------------------------------------------------
        const string orgSql = """
            SELECT o.Id,
                   o.Slug,
                   o.Name,
                   o.Description,
                   o.LogoUrl,
                   o.CoverImageUrl,
                   o.WebsiteUrl,
                   o.ContactEmail,
                   o.ContactPhone,
                   u.DisplayName   AS OwnerDisplayName,
                   o.CreatedAtUtc
            FROM   [org].[Organizations] o
            INNER JOIN [identity].[AspNetUsers] u ON u.Id = o.OwnerUserId
            WHERE  o.Slug      = @Slug
              AND  o.Status    = 'active'
              AND  o.IsDeleted = 0
            """;

        var org = await connection.QueryFirstOrDefaultAsync<OrganizationPublicProfileDto>(
            orgSql, new { request.Slug });

        if (org is null)
            throw new NotFoundException(nameof(Organization), request.Slug);

        // -----------------------------------------------------------------------
        // 2. Load upcoming public events for this organization
        // -----------------------------------------------------------------------
        // We already have org.Id from query #1, so we filter directly on
        // e.OrganizationId — no need to JOIN back to Organizations.
        //
        // Rules:
        //   - Date >= now  → only future events
        //   - IsCancelled = 0  → don't surface cancelled events publicly
        //   - TOP 20, ordered by Date ASC  → soonest first, bounded payload
        //   - LEFT JOIN Categories  → uncategorised events still appear
        // -----------------------------------------------------------------------
        const string eventsSql = """
            SELECT TOP 20
                   e.Id,
                   e.Title,
                   e.Description,
                   e.Date,
                   e.City,
                   e.Venue,
                   c.Name   AS CategoryName
            FROM   [evt].[Events] e
            LEFT JOIN [evt].[Categories] c ON c.Id = e.CategoryId
            WHERE  e.OrganizationId = @Id
              AND  e.Date           >= SYSUTCDATETIME()
              AND  e.IsCancelled     = 0
            ORDER BY e.Date ASC
            """;

        var events = await connection.QueryAsync<PublicEventSummaryDto>(
            eventsSql, new { org.Id });

        org.UpcomingEvents = events.ToList();

        return org;
    }
}
