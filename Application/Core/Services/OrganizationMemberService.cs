using Application.Core.Interfaces;
using Domain;
using Microsoft.EntityFrameworkCore;

namespace Application.Core.Services;

public class OrganizationMemberService(IAppDBContext context) : IOrganizationMemberService
{
    /// <summary>
    /// Checks if a user is an active member of ANY organization across the entire platform.
    /// This centrally enforces the business rule that a user can only belong to a single organization at a time.
    /// </summary>
    public async Task<bool> IsActiveMemberOfAnyOrganizationAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await context.OrganizationMembers
            .AnyAsync(m => m.UserId == userId 
                        && m.Status == OrganizationMemberStatus.Active 
                        && !m.IsDeleted, cancellationToken);
    }

    /// <summary>
    /// Retrieves the membership record between a specific user and organization.
    /// Used by handlers to determine the exact relationship state (e.g. Active, Invited, Declined).
    /// By centralizing this query, handlers (like InviteMember and AcceptInvite) stay DRY and 
    /// avoid duplicating EF Core lookup logic when enforcing business rules.
    /// </summary>
    public async Task<OrganizationMember?> GetMembershipAsync(Guid organizationId, string userId, CancellationToken cancellationToken = default)
    {
        return await context.OrganizationMembers
            .FirstOrDefaultAsync(m => m.OrganizationId == organizationId 
                                   && m.UserId == userId 
                                   && !m.IsDeleted, cancellationToken);
    }

    /// <summary>
    /// Retrieves the ID of the organization the user currently belongs to, either as the Owner or an Active Member.
    /// Primarily used during token generation to embed the organization ID directly into the JWT,
    /// enabling lightning-fast reads without repetitive database ownership lookups.
    /// </summary>
    public async Task<Guid?> GetActiveOrganizationIdAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await context.Organizations
            .Where(o => o.OwnerUserId == userId && !o.IsDeleted)
            .Select(o => (Guid?)o.Id)
            .FirstOrDefaultAsync(cancellationToken) 
            ?? await context.OrganizationMembers
            .Where(m => m.UserId == userId && m.Status == OrganizationMemberStatus.Active && !m.IsDeleted)
            .Select(m => (Guid?)m.OrganizationId)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
