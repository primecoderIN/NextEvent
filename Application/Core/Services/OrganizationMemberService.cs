using Application.Core.Interfaces;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Services;

public class OrganizationMemberService(IAppDBContext context) : IOrganizationMemberService
{
    public async Task<bool> IsActiveMemberOfAnyOrganizationAsync(string userId, CancellationToken cancellationToken = default)
    {
        // Check if there is ANY OrganizationMember record for this user with Status == Active
        // This centrally enforces the "User belongs to max one organization" rule.
        return await context.OrganizationMembers
            .AnyAsync(m => m.UserId == userId 
                        && m.Status == OrganizationMemberStatus.Active 
                        && !m.IsDeleted, cancellationToken);
    }

    public async Task<OrganizationMember?> GetMembershipAsync(Guid organizationId, string userId, CancellationToken cancellationToken = default)
    {
        return await context.OrganizationMembers
            .FirstOrDefaultAsync(m => m.OrganizationId == organizationId 
                                   && m.UserId == userId 
                                   && !m.IsDeleted, cancellationToken);
    }
}
