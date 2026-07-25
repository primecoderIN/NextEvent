using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.InviteOrganizationMember;

public class InviteOrganizationMemberCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationAuthorizationService authorizationService,
    IOrganizationMemberService memberService,
    UserManager<User> userManager) : IRequestHandler<InviteOrganizationMemberCommand, Guid>
{
    public async Task<Guid> Handle(
        InviteOrganizationMemberCommand request,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        // 1. Authorize: Does the user have 'members.invite' in this organization?
        await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.MembersInvite, cancellationToken);

        // 2. Look up the user by email
        var invitedUser = await userManager.FindByEmailAsync(request.Email)
            ?? throw new NotFoundException("User", request.Email);

        // 3. Enforce Single-Org Business Rule: Are they already an active member of ANY org?
        var isActiveAnywhere = await memberService.IsActiveMemberOfAnyOrganizationAsync(invitedUser.Id, cancellationToken);
        if (isActiveAnywhere)
            throw new BusinessRuleException("This user is already an active member of an organization and cannot be invited.");

        // 4. Check if they are already a member or invited to THIS org
        var existingMembership = await memberService.GetMembershipAsync(request.OrganizationId, invitedUser.Id, cancellationToken);

        if (existingMembership != null)
        {
            if (existingMembership.Status == OrganizationMemberStatus.Active)
                throw new BusinessRuleException("This user is already an active member of the organization.");
            if (existingMembership.Status == OrganizationMemberStatus.Invited)
                throw new BusinessRuleException("This user has already been invited to the organization.");
        }

        // 4. Fetch the default Member role
        var memberRole = await context.OrganizationRoles
            .FirstOrDefaultAsync(r => r.OrganizationId == request.OrganizationId 
                                   && r.Name == OrganizationRoleConstants.Member
                                   && !r.IsDeleted, cancellationToken)
            ?? throw new InvalidOperationException($"The default '{OrganizationRoleConstants.Member}' role could not be found for this organization.");

        // 5. Create the membership record
        var newMember = new OrganizationMember
        {
            OrganizationId = request.OrganizationId,
            UserId = invitedUser.Id,
            Status = OrganizationMemberStatus.Invited,
            CreatedByUserId = currentUserId,
            CreatedAtUtc = DateTimeOffset.UtcNow
        };

        // 6. Assign the Member role
        var memberRoleAssignment = new OrganizationMemberRole
        {
            OrganizationMemberId = newMember.Id,
            OrganizationRoleId = memberRole.Id
        };

        newMember.MemberRoles.Add(memberRoleAssignment);
        context.OrganizationMembers.Add(newMember);

        await context.SaveChangesAsync(cancellationToken);

        return newMember.Id;
    }
}
