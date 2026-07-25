using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.AcceptOrganizationInvitation;

public class AcceptOrganizationInvitationCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IOrganizationMemberService memberService) : IRequestHandler<AcceptOrganizationInvitationCommand>
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

        await context.SaveChangesAsync(cancellationToken);
    }
}
