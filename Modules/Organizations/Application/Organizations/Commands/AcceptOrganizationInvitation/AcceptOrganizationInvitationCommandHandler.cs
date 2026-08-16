using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.AcceptOrganizationInvitation;

public class AcceptOrganizationInvitationCommandHandler(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService,
    IOrganizationMemberService memberService,
    UserManager<Identity.Domain.User> userManager,
    IDateTimeProvider dateTimeProvider) : IRequestHandler<AcceptOrganizationInvitationCommand>
{
    public async Task Handle(
        AcceptOrganizationInvitationCommand request,
        CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("User not authenticated.");

        // 1. Enforce Single-Org Business Rule
        var isActiveAnywhere = await memberService.IsActiveMemberOfAnyOrganizationAsync(currentUserId, cancellationToken);
        if (isActiveAnywhere)
            throw new BusinessRuleException("You are already an active member of another organization and cannot accept this invitation.");

        // 2. Fetch the membership record directly from this module's DbContext
        var membership = await context.OrganizationMembers
            .FirstOrDefaultAsync(m => m.OrganizationId == request.OrganizationId && m.UserId == currentUserId, cancellationToken)
            ?? throw new NotFoundException("Invitation", request.OrganizationId);

        if (membership.Status == OrganizationMemberStatus.Active)
            throw new BusinessRuleException("You are already an active member of this organization.");

        if (membership.Status == OrganizationMemberStatus.Declined || membership.Status == OrganizationMemberStatus.Removed)
            throw new BusinessRuleException("This invitation is no longer valid.");

        membership.Status = OrganizationMemberStatus.Active;
        membership.JoinedAtUtc = dateTimeProvider.UtcNow;

        // 3. Remove/Decline all other pending invitations for this user
        var otherInvitations = await context.OrganizationMembers
            .Where(m => m.UserId == currentUserId && m.Status == OrganizationMemberStatus.Invited && m.Id != membership.Id && !m.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var invite in otherInvitations)
        {
            invite.Status = OrganizationMemberStatus.Declined;
        }

        // 4. Grant the Organizer platform role if they don't already have it
        var user = await userManager.FindByIdAsync(currentUserId)
            ?? throw new UnauthorizedException("User not found.");

        if (!await userManager.IsInRoleAsync(user, RoleConstants.Organizer))
        {
            await userManager.AddToRoleAsync(user, RoleConstants.Organizer);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
