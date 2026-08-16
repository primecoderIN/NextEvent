using MediatR;
using NextEvent.Shared.Pagination;
using NextEvent.Modules.Identity.Application.Users.DTOs;

namespace NextEvent.Modules.Identity.Application.Users.Queries.GetUsers;

public class GetUsersQuery : PaginationParams, IRequest<PagedList<UserDto>>
{
}
