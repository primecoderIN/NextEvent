using NextEvent.Modules.Identity.Application.Authentication.DTOs;
using MediatR;

namespace NextEvent.Modules.Identity.Application.Authentication.Commands.RefreshToken;
public class RefreshTokenCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Token { get; set; }
}
