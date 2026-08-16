using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NextEvent.Modules.Identity.Application.Users.Queries.GetUsers;
using NextEvent.Shared.Constants;
using NextEvent.Shared.Common;

namespace NextEvent.Modules.Identity.API;

[ApiController]
[Route("api/[controller]")]
public class UsersController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = RoleConstants.Admin)]
    public async Task<IActionResult> GetUsers([FromQuery] GetUsersQuery query)
    {
        var result = await mediator.Send(query);
        return Ok(ApiResponse.Ok(result));
    }
}
