using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NextEvent.Modules.Identity.Domain;
using NextEvent.Modules.Identity.Application.Users.DTOs;
using NextEvent.Shared.Pagination;

namespace NextEvent.Modules.Identity.Application.Users.Queries.GetUsers;

public class GetUsersQueryHandler(UserManager<User> userManager) : IRequestHandler<GetUsersQuery, PagedList<UserDto>>
{
    public async Task<PagedList<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var query = userManager.Users.AsQueryable();

        // Order by most recently registered
        query = query.OrderByDescending(u => u.CreatedAtUtc);

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                UserName = u.UserName!,
                Email = u.Email!,
                DisplayName = u.DisplayName,
                ImageUrl = u.ImageUrl,
                CreatedAtUtc = u.CreatedAtUtc
            })
            .ToListAsync(cancellationToken);

        return new PagedList<UserDto>(users, totalCount, request.PageNumber, request.PageSize);
    }
}
