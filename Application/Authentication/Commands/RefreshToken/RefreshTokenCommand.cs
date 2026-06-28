using Application.Authentication.DTOs;
// using MediatR;

namespace Application.Authentication.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResult<LoginResponseDto>>
{
    public required string Token { get; set; }
}
