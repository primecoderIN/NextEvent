using Application.Core.Exceptions;
using Application.Authentication.DTOs;
using Application.Authentication.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.Authentication.Commands.Login;

public class LoginCommandHandler(UserManager<User> userManager, ITokenService tokenService) 
    : IRequestHandler<LoginCommand, AuthResult<LoginResponseDto>>
{
    public async Task<AuthResult<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);

        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        {
            throw new UnauthorizedException("Invalid email or password");
        }

        var refreshToken = tokenService.GenerateRefreshToken();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTimeOffset.UtcNow.AddDays(7);
        
        await userManager.UpdateAsync(user);

        var roles = await userManager.GetRolesAsync(user);

        var userDto = new LoginResponseDto
        {
            DisplayName = user.DisplayName ?? user.UserName!,
            // Pass roles to CreateToken so they are embedded in the JWT claims
            Token = tokenService.CreateToken(user, roles),
            Username = user.UserName!,
            Image = user.ImageUrl,
            Roles = roles
        };

        return new AuthResult<LoginResponseDto>
        {
            User = userDto,
            RefreshToken = refreshToken
        };
    }
}
