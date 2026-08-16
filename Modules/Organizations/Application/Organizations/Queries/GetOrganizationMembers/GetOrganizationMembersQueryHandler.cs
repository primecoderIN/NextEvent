using MediatR;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Organizations.Application.Organizations.DTOs;
using NextEvent.Modules.Organizations.Persistence.Contexts;
using NextEvent.Shared.Constants;
using NextEvent.Shared.Interfaces;

namespace NextEvent.Modules.Organizations.Application.Organizations.Queries.GetOrganizationMembers;

public class GetOrganizationMembersQueryHandler(
    OrganizationsDbContext context,
    IOrganizationAuthorizationService authorizationService,
    ICurrentUserService currentUserService) : IRequestHandler<GetOrganizationMembersQuery, List<OrganizationMemberDto>>
{
    public async Task<List<OrganizationMemberDto>> Handle(GetOrganizationMembersQuery request, CancellationToken cancellationToken)
    {
        // BOLA / BFLA: Authorize that the caller has access to view this organization
        // Admins are globally authorized to view any organization's members.
        if (!currentUserService.HasRole(RoleConstants.Admin))
        {
            await authorizationService.AuthorizeAsync(request.OrganizationId, PermissionConstants.OrganizationView, cancellationToken);
        }

        var members = await context.OrganizationMembers
            .Include(m => m.User)
            .Include(m => m.MemberRoles)
                .ThenInclude(mr => mr.Role)
            .Where(m => m.OrganizationId == request.OrganizationId && !m.IsDeleted)
            .Select(m => new OrganizationMemberDto
            {
                Id = m.Id,
                UserId = m.UserId,
                UserName = m.User != null ? (m.User.DisplayName ?? "Unknown") : "Unknown",
                UserEmail = m.User != null ? m.User.Email! : "Unknown",
                Status = m.Status.ToString(),
                JoinedAtUtc = m.JoinedAtUtc,
                Roles = m.MemberRoles.Where(mr => !mr.Role!.IsDeleted).Select(mr => new OrganizationMemberRoleDto
                {
                    Id = mr.Role!.Id,
                    Name = mr.Role.Name
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return members;
    }
}
