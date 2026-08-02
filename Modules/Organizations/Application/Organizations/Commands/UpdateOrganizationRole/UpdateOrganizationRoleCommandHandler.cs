using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Shared.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.UpdateOrganizationRole;
public class UpdateOrganizationRoleCommandHandler(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService,
    IPermissionCacheService permissionCache)
    : IRequestHandler<UpdateOrganizationRoleCommand>
{
    public async Task Handle(
        UpdateOrganizationRoleCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        // 1. Authorize: Does the user have 'roles.manage' in this organization?
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.RolesManage, cancellationToken);

        // 2. Load the role including its current permissions
        // SECURITY (BOLA): We MUST forcefully bind the OrganizationId verified above against the OrganizationRoles table.
        // If we only looked up by `r.Id == request.RoleId`, a user in Org A could pass Org A's ID in the route (passing auth)
        // but pass a Role ID from Org B in the payload/route. This strict binding prevents cross-organization mutation.
        var role = await context.OrganizationRoles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == request.RoleId && r.OrganizationId == request.OrganizationId && !r.IsDeleted, cancellationToken)
            ?? throw new NotFoundException(nameof(OrganizationRole), request.RoleId);

        var dto = request.Role;

        // 3. Handle System Role constraints
        if (role.IsSystemRole)
        {
            if (dto.Name != null && role.Name != dto.Name)
            {
                throw new BusinessRuleException($"Cannot rename the system role '{role.Name}'.");
            }
            if (dto.Description != null && role.Description != dto.Description)
            {
                throw new BusinessRuleException($"Cannot change the description of the system role '{role.Name}'.");
            }
        }
        else
        {
            // 4. Update Name and Description if provided
            if (dto.Name != null)
            {
                var nameExists = await context.OrganizationRoles
                    .AnyAsync(r => r.OrganizationId == request.OrganizationId 
                                && r.Id != request.RoleId
                                && r.Name.ToLower() == dto.Name.ToLower() 
                                && !r.IsDeleted, cancellationToken);

                if (nameExists)
                    throw new BusinessRuleException($"A role with the name '{dto.Name}' already exists in this organization.");

                role.Name = dto.Name;
            }

            if (dto.Description != null)
            {
                role.Description = dto.Description;
            }
        }

        // 5. Update permissions if provided
        if (dto.Permissions != null)
        {
            var validPermissions = await context.Permissions
                .Where(p => dto.Permissions.Contains(p.Code))
                .ToListAsync(cancellationToken);

            var missingPermissions = dto.Permissions.Except(validPermissions.Select(p => p.Code)).ToList();
            if (missingPermissions.Count > 0)
            {
                throw new BusinessRuleException($"The following permission codes are invalid: {string.Join(", ", missingPermissions)}");
            }

            var permissionsToRemove = role.RolePermissions
                .Where(rp => !dto.Permissions.Contains(rp.Permission!.Code))
                .ToList();

            foreach (var rp in permissionsToRemove)
            {
                role.RolePermissions.Remove(rp);
            }

            var existingPermissionCodes = role.RolePermissions.Select(rp => rp.Permission!.Code).ToHashSet();
            var permissionsToAdd = validPermissions
                .Where(p => !existingPermissionCodes.Contains(p.Code))
                .ToList();

            foreach (var permission in permissionsToAdd)
            {
                role.RolePermissions.Add(new OrganizationRolePermission
                {
                    OrganizationRoleId = role.Id,
                    PermissionId = permission.Id,
                    Role = role,
                    Permission = permission
                });
            }
        }

        role.UpdatedAtUtc = DateTime.UtcNow;
        role.UpdatedByUserId = userId;

        await context.SaveChangesAsync(cancellationToken);

        // ── Invalidate Redis permission cache for all members of this org ────────
        // Permission codes changed — every cached entry for this org is now stale.
        // TTL would eventually evict them, but explicit invalidation ensures zero
        // stale reads after a role update.
        await permissionCache.InvalidateOrganizationAsync(request.OrganizationId, cancellationToken);
    }
}
