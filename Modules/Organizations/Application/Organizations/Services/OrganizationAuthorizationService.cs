using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Organizations.Application.Organizations.Services;

/// <summary>
/// The central authority for Organization-level RBAC (Role-Based Access Control).
///
/// SECURITY (BOLA/Tenant Isolation): This service strictly ensures that a user can only perform
/// actions within an organization if they are an ACTIVE member of that specific organization,
/// AND hold a role granting the specific permission code.
/// By centralizing this logic, we prevent cross-tenant data leakage and Broken Object Level Authorization.
///
/// PERFORMANCE (PERF-01): Permission resolution is cached in Redis.
/// - On a cache HIT  → returns immediately (no DB round-trip).
/// - On a cache MISS → executes the 4-level EF join, then populates the cache with a 5-minute TTL.
/// - Cache failures  → silently fall back to the DB so the request never breaks.
/// </summary>
public class OrganizationAuthorizationService(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService,
    IPermissionCacheService permissionCache)
    : IOrganizationAuthorizationService
{
    /// <summary>
    /// Gets all permission codes the current user has within the specified organization.
    /// </summary>
    public async Task<List<string>> GetUserPermissionsAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (userId is null)
            return new List<string>();

        // ── 1. Try the Redis cache first ──────────────────────────────────────
        var cachedPermissions = await permissionCache.GetPermissionsAsync(userId, organizationId, cancellationToken);
        if (cachedPermissions is not null)
        {
            // Cache HIT — no DB query needed
            return cachedPermissions.ToList();
        }

        // ── 2. Cache MISS — resolve from DB via the 4-level EF join ──────────
        var permissionCodes = await context.OrganizationMembers
            .Where(m => m.OrganizationId == organizationId
                     && m.UserId == userId
                     && m.Status == Domain.OrganizationMemberStatus.Active)
            .Include(m => m.MemberRoles)
            .ThenInclude(mr => mr.Role!)
            .ThenInclude(r => r.RolePermissions)
            .ThenInclude(rp => rp.Permission!)
            .SelectMany(m => m.MemberRoles)
            .Select(mr => mr.Role!)
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.Permission!)
            .Where(p => p != null)
            .Select(p => p.Code)
            .Distinct()
            .ToListAsync(cancellationToken);

        // ── 3. Populate cache so subsequent calls in this and future requests skip the DB ──
        await permissionCache.SetPermissionsAsync(userId, organizationId, permissionCodes, cancellationToken);

        return permissionCodes;
    }

    /// <summary>
    /// Evaluates whether the current authenticated user holds a role that grants the specified permission code
    /// within the given organization. Returns true or false without throwing exceptions.
    /// </summary>
    public async Task<bool> HasPermissionAsync(
        Guid organizationId,
        string permissionCode,
        CancellationToken cancellationToken = default)
    {
        var permissionCodes = await GetUserPermissionsAsync(organizationId, cancellationToken);
        return permissionCodes.Contains(permissionCode, StringComparer.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Strictly authorizes the current user against the given organization and permission.
    /// Throws a ForbiddenAccessException if the user lacks the required permission, immediately halting the request.
    /// </summary>
    public async Task AuthorizeAsync(
        Guid organizationId,
        string permissionCode,
        CancellationToken cancellationToken = default)
    {
        var hasPermission = await HasPermissionAsync(organizationId, permissionCode, cancellationToken);
        if (!hasPermission)
        {
            throw new ForbiddenAccessException(
                $"You do not have the required permission ({permissionCode}) to perform this action in the organization.");
        }
    }
}
