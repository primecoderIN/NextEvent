using Application.Authentication.DTOs;
// using MediatR;

namespace Application.Authentication.Commands.RefreshToken;

public class RefreshTokenCommand : IRequest<AuthResult>
{
    public required string Token { get; set; }
}
