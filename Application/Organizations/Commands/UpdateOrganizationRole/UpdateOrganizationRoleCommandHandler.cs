using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.UpdateOrganizationRole;

public class UpdateOrganizationRoleCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService)
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

        role.UpdatedAtUtc = DateTimeOffset.UtcNow;
        role.UpdatedByUserId = userId;

        await context.SaveChangesAsync(cancellationToken);
    }
}
