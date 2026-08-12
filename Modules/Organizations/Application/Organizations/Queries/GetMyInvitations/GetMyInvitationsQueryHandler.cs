using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using NextEvent.Modules.Organizations.Domain;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetMyInvitations;

public class GetMyInvitationsQueryHandler(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<GetMyInvitationsQuery, List<OrganizationInvitationDto>>
{
    public async Task<List<OrganizationInvitationDto>> Handle(GetMyInvitationsQuery request, CancellationToken cancellationToken)
    {
        var currentUserId = currentUserService.GetCurrentUserId();
        if (currentUserId == null)
        {
            throw new UnauthorizedException("User not authenticated.");
        }

        var invitations = await context.OrganizationMembers
            .Include(m => m.Organization)
            .Where(m => m.UserId == currentUserId && m.Status == OrganizationMemberStatus.Invited && !m.IsDeleted)
            .Select(m => new OrganizationInvitationDto
            {
                OrganizationId = m.OrganizationId,
                OrganizationName = m.Organization!.Name,
                OrganizationLogoUrl = m.Organization.LogoUrl,
                InvitedAtUtc = m.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return invitations;
    }
}
