// using MediatR;

namespace Application.Authentication.Commands.Logout;

public class LogoutCommand : IRequest<Unit>
{
    public required string Token { get; set; }
}
