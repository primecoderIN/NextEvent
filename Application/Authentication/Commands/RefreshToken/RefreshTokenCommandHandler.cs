using Application.Core.Exceptions;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
// using Domain;
// using MediatR;
using Microsoft.AspNetCore.Identity;
// using Microsoft.EntityFrameworkCore;

namespace Application.Authentication.Commands.RefreshToken;

public class RefreshTokenCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<RefreshTokenCommand, AuthResult>
{
    public async Task<AuthResult> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == request.Token && u.RefreshTokenExpiryTime > DateTime.UtcNow, cancellationToken);

        if (user == null)
        {
            throw new UnauthorizedException("Invalid or expired refresh token");
        }

        var newRefreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await userManager.UpdateAsync(user);

        var userDto = new UserDTO
        {
            DisplayName = user.DisplayName ?? user.UserName!,
            Token = tokenService.CreateToken(user),
            UserName = user.UserName!,
            Image = user.ImageUrl
        };

        return new AuthResult
        {
            User = userDto,
            RefreshToken = newRefreshToken
        };
    }
}
