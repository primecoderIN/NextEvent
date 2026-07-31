using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Organizations.Application.Organizations.Services;

/// <summary>
/// The central authority for Organization-level RBAC (Role-Based Access Control).
/// SECURITY (BOLA/Tenant Isolation): This service strictly ensures that a user can only perform 
/// actions within an organization if they are an ACTIVE member of that specific organization, 
/// AND hold a role granting the specific permission code. 
/// By centralizing this logic, we prevent cross-tenant data leakage and Broken Object Level Authorization.
/// </summary>
public class OrganizationAuthorizationService(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService) : IOrganizationAuthorizationService
{
    /// <summary>
    /// Evaluates whether the current authenticated user holds a role that grants the specified permission code 
    /// within the given organization. Returns true or false without throwing exceptions.
    /// </summary>
    public async Task<bool> HasPermissionAsync(Guid organizationId, string permissionCode, CancellationToken cancellationToken = default)
    {
        var userId = currentUserService.GetCurrentUserId();
        if (userId == null)
        {
            return false;
        }

        var hasPermission = await context.OrganizationMembers
            .Where(m => m.OrganizationId == organizationId 
                     && m.UserId == userId 
                     && m.Status == Domain.OrganizationMemberStatus.Active)
            .SelectMany(m => m.MemberRoles)
            .Select(mr => mr.Role!)
            .SelectMany(r => r.RolePermissions)
            .Select(rp => rp.Permission!)
            .AnyAsync(p => p != null && p.Code == permissionCode, cancellationToken);

        return hasPermission;
    }

    /// <summary>
    /// Strictly authorizes the current user against the given organization and permission.
    /// Throws a ForbiddenAccessException if the user lacks the required permission, immediately halting the request.
    /// </summary>
    public async Task AuthorizeAsync(Guid organizationId, string permissionCode, CancellationToken cancellationToken = default)
    {
        var hasPermission = await HasPermissionAsync(organizationId, permissionCode, cancellationToken);
        if (!hasPermission)
        {
            throw new ForbiddenAccessException($"You do not have the required permission ({permissionCode}) to perform this action in the organization.");
        }
    }
}
