using Application.Core.Exceptions;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
// using Domain;
// using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.RefreshToken;

public class RefreshTokenCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<RefreshTokenCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.Token && u.RefreshTokenExpiryTime > DateTime.UtcNow, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }

        var newRefreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        return new AuthResult<LoginResponseDto>
        {
            RefreshToken = newRefreshToken,
            User = new LoginResponseDto
            {
                DisplayName = user.DisplayName ?? user.UserName!,
                Image = user.ImageUrl,
                Token = tokenService.CreateToken(user),
                Username = user.UserName!
            }
        };
    }
}
