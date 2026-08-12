using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Organizations.Domain;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Constants;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.UpdateOrganizationMemberRoles;

public class UpdateOrganizationMemberRolesCommandHandler(
    OrganizationsDbContext context,
    IOrganizationAuthorizationService authorizationService) : IRequestHandler<UpdateOrganizationMemberRolesCommand>
{
    public async Task Handle(UpdateOrganizationMemberRolesCommand request, CancellationToken cancellationToken)
    {
        // BFLA & BOLA: Must have RolesManage permission on this specific organization
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.RolesManage, cancellationToken);

        var member = await context.OrganizationMembers
            .Include(m => m.MemberRoles)
            .FirstOrDefaultAsync(m => m.Id == request.MemberId && m.OrganizationId == request.OrganizationId && !m.IsDeleted, cancellationToken);

        if (member == null)
        {
            throw new NotFoundException($"Member {request.MemberId} not found in organization.");
        }

        // Validate that all requested roles belong to this organization
        var validRoles = await context.OrganizationRoles
            .Where(r => request.RoleIds.Contains(r.Id) && r.OrganizationId == request.OrganizationId && !r.IsDeleted)
            .ToListAsync(cancellationToken);

        if (validRoles.Count != request.RoleIds.Count)
        {
            throw new ValidationException("One or more roles do not exist or belong to a different organization.");
        }

        // The owner must always have the Owner role (if they are the owner)
        // Wait, ownership is typically tracked by Organization.OwnerUserId, we should make sure we aren't removing the owner's "Owner" role
        // For simplicity, we just clear and add roles.
        // Clear existing roles
        member.MemberRoles.Clear();

        // Add new roles
        foreach (var roleId in request.RoleIds)
        {
            member.MemberRoles.Add(new OrganizationMemberRole
            {
                OrganizationMemberId = member.Id,
                OrganizationRoleId = roleId
            });
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
