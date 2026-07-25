using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.AcceptOrganizationInvitation;

public class AcceptOrganizationInvitationCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationMemberService memberService,
    UserManager<User> userManager) : IRequestHandler<AcceptOrganizationInvitationCommand>
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

        // 2. Fetch the membership record
        var membership = await memberService.GetMembershipAsync(request.OrganizationId, currentUserId, cancellationToken)
            ?? throw new NotFoundException("Invitation", request.OrganizationId);

        if (membership.Status == OrganizationMemberStatus.Active)
            throw new BusinessRuleException("You are already an active member of this organization.");
            
        if (membership.Status == OrganizationMemberStatus.Declined || membership.Status == OrganizationMemberStatus.Removed)
            throw new BusinessRuleException("This invitation is no longer valid.");

        membership.Status = OrganizationMemberStatus.Active;
        membership.JoinedAtUtc = DateTimeOffset.UtcNow;

        // 3. Grant the Organizer platform role if they don't already have it
        var user = await userManager.FindByIdAsync(currentUserId)
            ?? throw new UnauthorizedException("User not found.");

        if (!await userManager.IsInRoleAsync(user, RoleConstants.Organizer))
        {
            await userManager.AddToRoleAsync(user, RoleConstants.Organizer);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
