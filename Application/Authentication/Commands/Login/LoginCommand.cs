using Application.Authentication.DTOs;
using MediatR;

namespace Application.Authentication.Commands.Login;

public class LoginCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Email { get; set; }
    public required string Password { get; set; }
}
