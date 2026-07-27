using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.CreateOrganizationRole;

public class CreateOrganizationRoleCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService)
    : IRequestHandler<CreateOrganizationRoleCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateOrganizationRoleCommand request,
        CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        // 1. Authorize: Does the user have 'roles.manage' in this organization?
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.RolesManage, cancellationToken);

        var dto = request.Role;

        // 2. Validate uniqueness of the role name within the organization
        var nameExists = await context.OrganizationRoles
            .AnyAsync(r => r.OrganizationId == request.OrganizationId 
                        && r.Name.ToLower() == dto.Name.ToLower() 
                        && !r.IsDeleted, cancellationToken);

        if (nameExists)
            throw new BusinessRuleException($"A role with the name '{dto.Name}' already exists in this organization.");

        // 3. Load requested permissions from DB to ensure they are valid
        var validPermissions = await context.Permissions
            .Where(p => dto.Permissions.Contains(p.Code))
            .ToListAsync(cancellationToken);

        var missingPermissions = dto.Permissions.Except(validPermissions.Select(p => p.Code)).ToList();
        if (missingPermissions.Count > 0)
        {
            throw new BusinessRuleException($"The following permission codes are invalid: {string.Join(", ", missingPermissions)}");
        }

        var now = DateTime.UtcNow;

        // 4. Create the role
        var newRole = new OrganizationRole
        {
            OrganizationId = request.OrganizationId,
            Name = dto.Name,
            Description = dto.Description,
            IsSystemRole = false, // Custom role
            CreatedAtUtc = now,
            CreatedByUserId = userId,
        };

        // 5. Attach permissions
        foreach (var permission in validPermissions)
        {
            newRole.RolePermissions.Add(new OrganizationRolePermission
            {
                OrganizationRoleId = newRole.Id,
                PermissionId = permission.Id,
                Role = newRole,
                Permission = permission
            });
        }

        context.OrganizationRoles.Add(newRole);
        await context.SaveChangesAsync(cancellationToken);

        return newRole.Id;
    }
}
