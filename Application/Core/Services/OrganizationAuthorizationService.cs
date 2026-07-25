using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Services;

public class OrganizationAuthorizationService(
    IAppDBContext context,
    ICurrentUserService currentUserService) : IOrganizationAuthorizationService
{
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

    public async Task AuthorizeAsync(Guid organizationId, string permissionCode, CancellationToken cancellationToken = default)
    {
        var hasPermission = await HasPermissionAsync(organizationId, permissionCode, cancellationToken);
        if (!hasPermission)
        {
            throw new ForbiddenAccessException($"You do not have the required permission ({permissionCode}) to perform this action in the organization.");
        }
    }
}
