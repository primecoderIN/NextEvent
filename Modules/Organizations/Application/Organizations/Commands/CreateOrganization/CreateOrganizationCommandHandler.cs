using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Exceptions;
using NextEvent.Shared.Interfaces;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Shared.Constants;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace NextEvent.Modules.Organizations.Application.Organizations.Commands.CreateOrganization;
/// <summary>
/// Handles <see cref="CreateOrganizationCommand"/>.
///
/// Full transaction (single SaveChangesAsync):
///   1. Guard — reject duplicate slugs.
///   2. Create Organization row (status: pending_verification, owner = current user).
///   3. Create 5 system OrganizationRoles for this org.
///   4. Load the seeded Permission rows that each role needs.
///   5. Wire OrganizationRolePermissions (role → permission join rows).
///   6. Create OrganizationMember for the owner (status: Active, JoinedAtUtc = now).
///   7. Assign the Owner role to that member via OrganizationMemberRole.
///   8. SaveChangesAsync — all 6 entity groups commit atomically.
/// </summary>
public class CreateOrganizationCommandHandler(
    OrganizationsDbContext context,
    ICurrentUserService currentUserService,
    IOrganizationMemberService memberService)
    : IRequestHandler<CreateOrganizationCommand, Guid>
{
    public async Task<Guid> Handle(
        CreateOrganizationCommand request,
        CancellationToken cancellationToken)
    {
        // ── 0. Resolve current user ───────────────────────────────────────────
        var userId = currentUserService.GetCurrentUserId()
            ?? throw new UnauthorizedException("You must be authenticated to create an organization.");

        // ── 0.5. Enforce Single-Org Business Rule ─────────────────────────────
        var isActiveAnywhere = await memberService.IsActiveMemberOfAnyOrganizationAsync(userId, cancellationToken);
        if (isActiveAnywhere)
            throw new BusinessRuleException("You are already an active member of an organization and cannot create a new one.");

        var dto = request.Organization;

        // ── 1. Slug uniqueness guard ──────────────────────────────────────────
        var slugTaken = await context.Organizations
            .AnyAsync(o => o.Slug == dto.Slug && !o.IsDeleted, cancellationToken);

        if (slugTaken)
            throw new BusinessRuleException($"The slug '{dto.Slug}' is already taken. Please choose a different slug.");

        var now = DateTime.UtcNow;

        // ── 2. Create Organization ────────────────────────────────────────────
        var organization = new Organization
        {
            Name            = dto.Name,
            Slug            = dto.Slug,
            Description     = dto.Description,
            WebsiteUrl      = dto.WebsiteUrl,
            ContactEmail    = dto.ContactEmail,
            ContactPhone    = dto.ContactPhone,
            Status          = "pending_verification",   // Admin must approve before going live
            OwnerUserId     = userId,
            CreatedByUserId = userId,
            CreatedAtUtc    = now,
        };
        context.Organizations.Add(organization);

        // ── 3. Load the permission catalogue (keyed by Code) ─────────────────
        // Fetch only the codes we actually need so we never do a full table scan.
        var requiredCodes = OrganizationRoleConstants.DefaultPermissions.Values
            .SelectMany(codes => codes)
            .Distinct()
            .ToHashSet();

        var permissionsByCode = await context.Permissions
            .Where(p => requiredCodes.Contains(p.Code))
            .ToDictionaryAsync(p => p.Code, cancellationToken);

        // ── 4. Create system OrganizationRoles + wire permissions ─────────────
        var rolesByName = new Dictionary<string, OrganizationRole>();

        foreach (var (roleName, permissionCodes) in OrganizationRoleConstants.DefaultPermissions)
        {
            var role = new OrganizationRole
            {
                OrganizationId  = organization.Id,
                Name            = roleName,
                IsSystemRole    = true,
                CreatedByUserId = userId,
                CreatedAtUtc    = now,
            };

            // ── 5. Attach OrganizationRolePermissions ─────────────────────────
            foreach (var code in permissionCodes)
            {
                if (!permissionsByCode.TryGetValue(code, out var permission))
                    throw new BusinessRuleException(
                        $"Permission '{code}' is missing from the database. Run the seeder before creating organizations.");

                role.RolePermissions.Add(new OrganizationRolePermission
                {
                    OrganizationRoleId = role.Id,
                    PermissionId       = permission.Id,
                    Role               = role,
                    Permission         = permission,
                });
            }

            context.OrganizationRoles.Add(role);
            rolesByName[roleName] = role;
        }

        // ── 6. Create owner OrganizationMember (Active from the start) ────────
        // Owner memberships skip the invitation flow and go straight to Active.
        var ownerMember = new OrganizationMember
        {
            OrganizationId  = organization.Id,
            UserId          = userId,
            Status          = OrganizationMemberStatus.Active,
            JoinedAtUtc     = now,
            CreatedByUserId = userId,
            CreatedAtUtc    = now,
        };
        context.OrganizationMembers.Add(ownerMember);

        // ── 7. Assign Owner role to the owner member ──────────────────────────
        var ownerRole = rolesByName[OrganizationRoleConstants.Owner];
        context.OrganizationMemberRoles.Add(new OrganizationMemberRole
        {
            OrganizationMemberId = ownerMember.Id,
            OrganizationRoleId   = ownerRole.Id,
        });

        // ── 8. Single atomic commit ───────────────────────────────────────────
        // EF Core tracks all entities added above and flushes them in one
        // database transaction. If any constraint fails the whole operation
        // rolls back — no partial state is ever written.
        await context.SaveChangesAsync(cancellationToken);

        return organization.Id;
    }
}
