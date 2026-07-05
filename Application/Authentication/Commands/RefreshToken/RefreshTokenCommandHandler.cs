using Application.Core.Exceptions;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.RefreshToken;

public class RefreshTokenCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<RefreshTokenCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.Token, cancellationToken);

        if (user == null || user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Invalid refresh token");
        }

        var newRefreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);

        return new AuthResult<LoginResponseDto>
        {
            RefreshToken = newRefreshToken,
            User = new LoginResponseDto
            {
                DisplayName = user.DisplayName ?? user.UserName!,
                Image = user.ImageUrl,
                // Pass roles to CreateToken so they are embedded in the refreshed JWT claims
                Token = tokenService.CreateToken(user, roles),
                Username = user.UserName!,
                Roles = roles
            }
        };
    }
}
