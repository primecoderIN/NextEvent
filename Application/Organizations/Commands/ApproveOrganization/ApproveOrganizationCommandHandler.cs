using Application.Core.Exceptions;
using Application.Core.Interfaces;
using Domain.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Application.Organizations.Commands.ApproveOrganization;

/// <summary>
/// Handles <see cref="ApproveOrganizationCommand"/>.
///
/// Transaction steps (single SaveChangesAsync):
///   1. Load the organization — throw NotFoundException if absent or deleted.
///   2. Guard: reject if already active or suspended/rejected.
///   3. Set Status → "active", VerifiedAtUtc, VerifiedByUserId.
///   4. SaveChangesAsync — organization status persisted.
///   5. Assign ASP.NET Identity "Organizer" role to the owner via IIdentityService.
///      (Step 5 is outside the EF transaction intentionally: Identity uses its own
///       DbContext transaction internally. If role assignment fails after the org is
///       saved, an Admin can re-trigger the approval or assign the role manually —
///       both operations are idempotent.)
/// </summary>
public class ApproveOrganizationCommandHandler(
    IAppDBContext context,
    ICurrentUserService currentUserService,
    IIdentityService identityService)
    : IRequestHandler<ApproveOrganizationCommand>
{
    public async Task Handle(
        ApproveOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        // ── 1. Load organization ──────────────────────────────────────────────
        var organization = await context.Organizations
            .FirstOrDefaultAsync(o => o.Id == request.OrganizationId && !o.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Organization", request.OrganizationId);

        // ── 2. State guard ────────────────────────────────────────────────────
        // Suspended / rejected orgs require a different admin action — not approve.
        if (organization.Status is "suspended" or "rejected")
            throw new BusinessRuleException(
                $"Organization cannot be approved from status '{organization.Status}'. " +
                "Only 'pending_verification' organizations can be approved.");

        var adminUserId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("Approving admin user could not be identified.");

        // ── 3. Update status (skip if already active — safe retry path) ───────
        // If a previous approval saved the org status but then crashed before the
        // Identity role assignment, an admin retries this endpoint. We skip the
        // redundant DB write and fall through to the idempotent role grant.
        if (organization.Status != "active")
        {
            var now = DateTimeOffset.UtcNow;
            organization.Status           = "active";
            organization.VerifiedAtUtc    = now;
            organization.VerifiedByUserId = adminUserId;
            organization.UpdatedAtUtc     = now;
            organization.UpdatedByUserId  = adminUserId;

            // ── 4. Persist org status change ──────────────────────────────────
            await context.SaveChangesAsync(cancellationToken);
        }

        // ── 5. Grant Organizer platform role to the owner ─────────────────────
        // AssignRoleAsync is idempotent — no-ops if the role is already held.
        // This step runs whether or not the org was just updated, so a retry
        // after a mid-flight crash always completes the full operation.
        await identityService.AssignRoleAsync(
            organization.OwnerUserId,
            RoleConstants.Organizer,
            cancellationToken);
    }
}
