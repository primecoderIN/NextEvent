using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using MediatR;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.Login;
public class LoginCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
