using MediatR;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.Logout;
public class LogoutCommand : IRequest<Unit>
{
    public required string Token { get; set; }
}
