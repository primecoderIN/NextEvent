using Application.Core.Exceptions;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
// using Domain;
// using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Authentication.Commands.Login;

public class LoginCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<LoginCommand, AuthResult>
{
    public async Task<AuthResult> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            throw new UnauthorizedException("User does not exist");
        }

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
        {
            throw new UnauthorizedException("Invalid Password");
        }

        // We do not set the refresh token cookie here.
        // Instead, we just generate and return it. The controller will handle HTTP semantics.
        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
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
            RefreshToken = refreshToken
        };
    }
}
